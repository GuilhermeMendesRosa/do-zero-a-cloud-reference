CREATE TABLE boards (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE board_columns (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    position_index INTEGER NOT NULL,
    board_id UUID NOT NULL,
    CONSTRAINT fk_board_columns_board
        FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
);

CREATE INDEX idx_board_columns_board_position
    ON board_columns (board_id, position_index);

CREATE TABLE kanban_tasks (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    position_index INTEGER NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP(6) WITH TIME ZONE,
    completed BOOLEAN NOT NULL,
    column_id UUID NOT NULL,
    CONSTRAINT fk_kanban_tasks_column
        FOREIGN KEY (column_id) REFERENCES board_columns (id) ON DELETE CASCADE
);

CREATE INDEX idx_kanban_tasks_column_position
    ON kanban_tasks (column_id, position_index);

CREATE TABLE task_tags (
    task_id UUID NOT NULL,
    tag_order INTEGER NOT NULL,
    tag VARCHAR(40) NOT NULL,
    PRIMARY KEY (task_id, tag_order),
    CONSTRAINT fk_task_tags_task
        FOREIGN KEY (task_id) REFERENCES kanban_tasks (id) ON DELETE CASCADE
);
