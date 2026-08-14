package br.udesc.kanban_backend.task;

import br.udesc.kanban_backend.column.BoardColumn;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "kanban_tasks")
public class KanbanTask {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "position_index", nullable = false)
    private int position;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(nullable = false)
    private boolean completed;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", nullable = false, length = 40)
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "column_id", nullable = false)
    private BoardColumn column;

    protected KanbanTask() {
    }

    public KanbanTask(
            String name,
            int position,
            Instant createdAt,
            Instant dueDate,
            boolean completed,
            List<String> tags,
            BoardColumn column
    ) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.position = position;
        this.createdAt = createdAt;
        this.dueDate = dueDate;
        this.completed = completed;
        this.tags = new ArrayList<>(tags);
        this.column = column;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getPosition() {
        return position;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public List<String> getTags() {
        return List.copyOf(tags);
    }

    public BoardColumn getColumn() {
        return column;
    }

    public void update(
            String name,
            int position,
            Instant dueDate,
            boolean completed,
            List<String> tags,
            BoardColumn column
    ) {
        this.name = name;
        this.position = position;
        this.dueDate = dueDate;
        this.completed = completed;
        this.tags.clear();
        this.tags.addAll(tags);
        this.column = column;
    }
}
