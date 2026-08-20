package br.udesc.kanban_backend.column;

import br.udesc.kanban_backend.board.Board;
import br.udesc.kanban_backend.task.KanbanTask;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "board_columns")
public class BoardColumn {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "position_index", nullable = false)
    private int position;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @OneToMany(mappedBy = "column", cascade = CascadeType.REMOVE)
    private List<KanbanTask> tasks = new ArrayList<>();

    protected BoardColumn() {
    }

    public BoardColumn(String name, int position, Board board) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.position = position;
        this.board = board;
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

    public Board getBoard() {
        return board;
    }

    public void update(String name, int position, Board board) {
        this.name = name;
        this.position = position;
        this.board = board;
    }
}
