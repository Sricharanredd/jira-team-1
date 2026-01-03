import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

const TaskCard = ({ task, onClick, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isOverlay) {
    return (
      <div
        className="bg-white p-3 rounded shadow-lg mb-2 border-2 border-blue-500 cursor-grabbing rotate-2 scale-105"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-500 uppercase">
            {task.story_code || `ID-${task.id}`}
          </span>
        </div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
               {task.project_name}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${task.issue_type === 'bug' ? 'bg-red-50 text-red-600 border-red-200' : task.issue_type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                {task.issue_type || 'story'}
            </span>
         </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={classNames(
        'bg-white p-3 rounded-lg shadow-sm mb-2 border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all touch-none group relative',
        { 'opacity-40': isDragging }
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-500 uppercase">
          {task.story_code || `ID-${task.id}`}
        </span>
      </div>
      <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>
      <div className="flex items-center justify-between mt-2">
         <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
             {task.project_name}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${task.issue_type === 'bug' ? 'bg-red-50 text-red-600 border-red-200' : task.issue_type === 'task' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
              {task.issue_type || 'story'}
          </span>
       </div>
    </div>
  );
};

export default TaskCard;
