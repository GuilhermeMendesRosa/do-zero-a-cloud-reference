package br.udesc.kanban_backend.column;

import br.udesc.kanban_backend.board.Board;
import br.udesc.kanban_backend.board.BoardRepository;
import br.udesc.kanban_backend.column.dto.ColumnRequest;
import br.udesc.kanban_backend.column.dto.ColumnResponse;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ColumnServiceTest {

    @Mock
    private ColumnRepository columnRepository;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private TaskRepository taskRepository;

    private ColumnService columnService;

    @BeforeEach
    void setUp() {
        columnService = new ColumnService(columnRepository, boardRepository, taskRepository);
    }

    @Test
    void shouldListColumnsFromExistingBoard() {
        Board board = new Board("Projeto");
        BoardColumn column = new BoardColumn("A fazer", 0, board);
        when(boardRepository.existsById(board.getId())).thenReturn(true);
        when(columnRepository.findByBoard_IdOrderByPositionAsc(board.getId())).thenReturn(List.of(column));

        List<ColumnResponse> response = columnService.listByBoard(board.getId());

        assertEquals(1, response.size());
        assertEquals(board.getId(), response.getFirst().boardId());
    }

    @Test
    void shouldRejectListWhenBoardDoesNotExist() {
        UUID boardId = UUID.randomUUID();
        when(boardRepository.existsById(boardId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> columnService.listByBoard(boardId));
    }

    @Test
    void shouldCreateColumnInExistingBoard() {
        Board board = new Board("Projeto");
        ColumnRequest request = new ColumnRequest("  A fazer  ", 0, board.getId());
        when(boardRepository.findById(board.getId())).thenReturn(Optional.of(board));
        when(columnRepository.save(any(BoardColumn.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ColumnResponse response = columnService.create(request);

        ArgumentCaptor<BoardColumn> captor = ArgumentCaptor.forClass(BoardColumn.class);
        verify(columnRepository).save(captor.capture());
        assertEquals("A fazer", captor.getValue().getName());
        assertEquals(board.getId(), response.boardId());
    }

    @Test
    void shouldUpdateColumnAndAllowMovingToAnotherBoard() {
        Board originalBoard = new Board("Original");
        Board destinationBoard = new Board("Destino");
        BoardColumn column = new BoardColumn("A fazer", 0, originalBoard);
        when(columnRepository.findById(column.getId())).thenReturn(Optional.of(column));
        when(boardRepository.findById(destinationBoard.getId())).thenReturn(Optional.of(destinationBoard));

        ColumnResponse response = columnService.update(
                column.getId(),
                new ColumnRequest("Fazendo", 1, destinationBoard.getId())
        );

        assertEquals("Fazendo", response.name());
        assertEquals(1, response.position());
        assertEquals(destinationBoard.getId(), response.boardId());
    }

    @Test
    void shouldDeleteColumnTasksBeforeColumn() {
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
        when(columnRepository.findById(column.getId())).thenReturn(Optional.of(column));
        when(taskRepository.findByColumn_IdOrderByPositionAsc(column.getId())).thenReturn(List.of(task));

        columnService.delete(column.getId());

        verify(taskRepository).deleteAll(List.of(task));
        verify(columnRepository).delete(column);
    }
}
