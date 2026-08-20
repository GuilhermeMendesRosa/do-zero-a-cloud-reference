package br.udesc.kanban_backend.board;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import br.udesc.kanban_backend.column.BoardColumn;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "boards")
public class Board {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE)
    private List<BoardColumn> columns = new ArrayList<>();

    protected Board() {
    }

    public Board(String name) {
        this.id = UUID.randomUUID();
        this.name = name;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void rename(String name) {
        this.name = name;
    }
}
