package br.udesc.kanban_backend.board;

import br.udesc.kanban_backend.board.dto.BoardRequest;
import br.udesc.kanban_backend.board.dto.BoardResponse;
import br.udesc.kanban_backend.column.BoardColumn;
import br.udesc.kanban_backend.column.ColumnRepository;
import br.udesc.kanban_backend.shared.ResourceNotFoundException;
import br.udesc.kanban_backend.task.KanbanTask;
import br.udesc.kanban_backend.task.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private ColumnRepository columnRepository;

    @Mock
    private TaskRepository taskRepository;

    private BoardService boardService;

    @BeforeEach
    void setUp() {
        boardService = new BoardService(boardRepository, columnRepository, taskRepository);
    }

    @Test
    void shouldListBoardsUsingRepositoryOrder() {
        Board first = new Board("Projeto A");
        Board second = new Board("Projeto B");
        when(boardRepository.findAllByOrderByNameAsc()).thenReturn(List.of(first, second));

        List<BoardResponse> response = boardService.list();

        assertEquals(List.of("Projeto A", "Projeto B"), response.stream().map(BoardResponse::name).toList());
    }

    @Test
    void shouldCreateBoardWithTrimmedName() {
        when(boardRepository.save(org.mockito.ArgumentMatchers.any(Board.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BoardResponse response = boardService.create(new BoardRequest("  Projeto A  "));

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertEquals("Projeto A", captor.getValue().getName());
        assertEquals("Projeto A", response.name());
    }

    @Test
    void shouldUpdateExistingBoard() {
        UUID boardId = UUID.randomUUID();
        Board board = new Board("Antigo");
        when(boardRepository.findById(boardId)).thenReturn(Optional.of(board));

        BoardResponse response = boardService.update(boardId, new BoardRequest("Novo"));

        assertEquals("Novo", response.name());
        assertEquals("Novo", board.getName());
    }

    @Test
    void shouldRejectUpdateWhenBoardDoesNotExist() {
        UUID boardId = UUID.randomUUID();
        when(boardRepository.findById(boardId)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> boardService.update(boardId, new BoardRequest("Novo"))
        );
    }

    @Test
    void shouldDeleteBoardColumnsAndTasks() {
        UUID boardId = UUID.randomUUID();
        Board board = new Board("Projeto");
        BoardColumn column = new BoardColumn("A fazer", 0, board);
        KanbanTask task = new KanbanTask(
                "Tarefa",
                0,
                Instant.parse("2026-02-05T10:00:00Z"),
                null,
                false,
                List.of(),
                column
        );
        when(boardRepository.findById(boardId)).thenReturn(Optional.of(board));
        when(columnRepository.findByBoard_IdOrderByPositionAsc(boardId)).thenReturn(List.of(column));
        when(taskRepository.findByColumn_IdOrderByPositionAsc(column.getId())).thenReturn(List.of(task));

        boardService.delete(boardId);

        verify(taskRepository).deleteAll(List.of(task));
        verify(columnRepository).deleteAll(List.of(column));
        verify(boardRepository).delete(board);
    }
}
