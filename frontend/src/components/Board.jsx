import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import api, { toFormData, updateUserStoryStatus } from '../api/api';
import TaskCard from './TaskCard';
import CreateStoryModal from './modals/CreateStoryModal';
import ProjectHeader from './ProjectHeader';

// Columns configuration with colors
import { STORY_STATUS, ISSUE_TYPE_OPTIONS } from '../constants';

// Columns configuration with colors
const COLUMNS = {
  [STORY_STATUS.TODO]: { title: 'TO DO', id: STORY_STATUS.TODO, color: 'bg-gray-500', bg: 'bg-gray-50' },
  [STORY_STATUS.IN_PROGRESS]: { title: 'IN PROGRESS', id: STORY_STATUS.IN_PROGRESS, color: 'bg-blue-500', bg: 'bg-blue-50' },
  [STORY_STATUS.TESTING]: { title: 'TESTING', id: STORY_STATUS.TESTING, color: 'bg-orange-500', bg: 'bg-orange-50' },
  [STORY_STATUS.DONE]: { title: 'DONE', id: STORY_STATUS.DONE, color: 'bg-green-500', bg: 'bg-green-50' },
};

const Column = ({ title, id, tasks, onClickTask, color, bg, onCreateIssue, canCreateIssue }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className={`w-80 flex-shrink-0 flex flex-col rounded-xl bg-gray-100/50 border border-gray-200 transition-colors ${isOver ? 'bg-blue-50/80 border-blue-200' : ''}`}>
      <div className={`p-4 font-bold text-gray-500 text-xs flex justify-between items-center tracking-wide uppercase rounded-t-xl border-b border-gray-100 ${bg}`}>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${color}`}></div>
           {title}
        </div>
        <span className="bg-white/80 text-gray-600 px-2 py-0.5 rounded-full text-[10px] shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 p-3 min-h-[150px]">
        <SortableContext
          id={id}
          items={tasks.map((t) => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onClickTask} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
           <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 text-sm italic min-h-[100px] border-2 border-dashed border-gray-100 rounded-lg">
              {id === 'todo' && canCreateIssue ? (
                 <button 
                   onClick={onCreateIssue}
                   className="flex items-center gap-1 text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create first issue
                 </button>
              ) : (
                <span>Drop here</span>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

const Board = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  // Context Data
  const { issues: tasks, loading, error, refreshIssues, currentProject, canCreateIssue, canChangeStatus } = useProject();
  
  const [activeTask, setActiveTask] = useState(null);
  
  // Use Global App Context
  

  const projectName = currentProject ? currentProject.project_name : (error ? 'Error Loading Project' : '');
  
  // Modals state

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
      // Disable sensor if cannot change status
      disabled: !canChangeStatus, 
    })
  );

  // Listen for global story creation events to trigger refresh
  useEffect(() => {
     const handleStoryCreated = () => refreshIssues();
     window.addEventListener('story-created', handleStoryCreated);
     return () => window.removeEventListener('story-created', handleStoryCreated);
  }, [refreshIssues]);

  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sprintFilter, setSprintFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Separate Epics and Board Tasks
  const epics = tasks.filter(t => t.issue_type === 'epic');
  const boardTasks = tasks.filter(t => t.issue_type !== 'epic'); // Stories, Tasks, Bugs, Subtasks
  
  const filteredBoardTasks = boardTasks.filter(task => {
        // Validation: Must have a Sprint AND not be 'backlog' status
        if (!task.sprint_number || task.status === 'backlog') return false;

        const matchesAssignee = assigneeFilter ? task.assignee === assigneeFilter : true;
        const matchesSprint = sprintFilter ? task.sprint_number === sprintFilter : true;
        const matchesType = typeFilter ? task.issue_type === typeFilter : true;
        return matchesAssignee && matchesSprint && matchesType;
  });

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => String(t.id) === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => String(t.id) === activeId);
    if (!task) return;

    let newStatus = null;

    if (Object.keys(COLUMNS).includes(overId)) {
      newStatus = overId;
    } else {
        const overTask = tasks.find((t) => String(t.id) === overId);
        if (overTask) {
            newStatus = overTask.status;
        }
    }

    if (newStatus && newStatus !== task.status) {
       // Optimistic UI Update not easily possible with Context unless we add a method to context.
       // For now, let's rely on rapid refresh or we can mutate local state?
       // But 'tasks' comes from context. We cannot mutate it directly.
       // We should call updateUserStoryStatus then refresh.
       
       // Note: To make it smooth, we might want to implement optimistic updates in Context later.
       // For this step, we'll accept a slight delay for correctness.
       
      try {
        await updateUserStoryStatus(task.id, newStatus);
        refreshIssues();
      } catch (error) {
        console.error('Failed to update task status', error);
        const message = error.response?.data?.detail || 'Failed to update status.';
        alert(message);
      }
    }
  };

  const handleTaskClick = (task) => {
    // Navigate to full details page instead of modal
    navigate(`/projects/${projectId}/issues/${task.id}?context=board`);
  };
  
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };


  // Stats
  const totalIssues = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const testing = tasks.filter(t => t.status === 'testing').length;
  
  const headerProjectName = projectId ? (projectName || 'Loading...') : 'All Projects';

  if (error) return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Project</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
                onClick={() => window.location.href = '/'} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
                Go to Dashboard
            </button>
          </div>
      </div>
  );

  if (loading && tasks.length === 0) return <div className="p-10 text-center text-gray-500">Loading board...</div>;


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header Removed (Handled by Layout) */}
      
      {/* Stats and Filters Bar */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10 sticky top-0">
          <div>
            {projectId && (
                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <span>{filteredBoardTasks.length} issues</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-blue-600">{inProgress} in progress</span>
                </div>
            )}
          </div>
          
          <div className="flex gap-4">
             {/* Board Filters */}
             <select 
                value={sprintFilter} 
                onChange={(e) => setSprintFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Sprints</option>
                {[...new Set(tasks.map(t => t.sprint_number).filter(Boolean))].map(s => <option key={s} value={s}>Sprint {s}</option>)}
            </select>

            <select 
                value={assigneeFilter} 
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Assignees</option>
                {[...new Set(tasks.map(t => t.assignee).filter(Boolean))].map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                <option value="">All Types</option>
                {ISSUE_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
      </div>

      <div className="flex-1 p-8 flex flex-col gap-8 min-h-0">
        
        {/* Epics Section (Validation: Shown separately) */}
        {epics.length > 0 && (
            <div className="flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded bg-purple-600"></span>
                    Epics ({epics.length})
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {epics.map(epic => (
                        <div key={epic.id} className="min-w-[200px] bg-white p-3 rounded-lg border border-purple-100 shadow-sm flex flex-col gap-1 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleTaskClick(epic)}>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 uppercase">{epic.story_code}</span>
                                <span className={`w-2 h-2 rounded-full ${epic.status === 'done' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 truncate" title={epic.title}>{epic.title}</h4>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex bg-transparent space-x-6 items-start h-auto pb-4 overflow-x-auto">
            {Object.values(COLUMNS).map((col) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                color={col.color}
                bg={col.bg}
                tasks={filteredBoardTasks.filter((t) => t.status === col.id)}
                onClickTask={handleTaskClick}
                onCreateIssue={() => openCreateIssueModal(projectId)}
                canCreateIssue={canCreateIssue}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Board;
