export const STORY_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  TESTING: 'testing',
  DONE: 'done',
};

export const STATUS_OPTIONS = [
  { value: STORY_STATUS.BACKLOG, label: 'Backlog' },
  { value: STORY_STATUS.TODO, label: 'To Do' },
  { value: STORY_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: STORY_STATUS.TESTING, label: 'Testing' },
  { value: STORY_STATUS.DONE, label: 'Done' },
];

export const ISSUE_TYPE = {
  EPIC: 'epic',
  STORY: 'story',
  TASK: 'task',
  BUG: 'bug',
  SUBTASK: 'subtask',
};

export const ISSUE_TYPE_OPTIONS = [
  { value: ISSUE_TYPE.EPIC, label: 'Epic' },
  { value: ISSUE_TYPE.STORY, label: 'Story' },
  { value: ISSUE_TYPE.TASK, label: 'Task' },
  { value: ISSUE_TYPE.BUG, label: 'Bug' },
  { value: ISSUE_TYPE.SUBTASK, label: 'Subtask' },
];
