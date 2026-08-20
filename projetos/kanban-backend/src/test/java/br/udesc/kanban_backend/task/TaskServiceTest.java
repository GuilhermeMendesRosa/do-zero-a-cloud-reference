package br.udesc.kanban_backend.task;

import br.udesc.kanban_backend.board.Board;
import br.udesc.kanban_backend.column.BoardColumn;
import br.udesc.kanban_backend.column.ColumnService;
import br.udesc.kanban_backend.shared.BadRequestException;
import br.udesc.kanban_backend.shared.ResourceNotFoundException;
import br.udesc.kanban_backend.task.dto.CreateTaskRequest;
import br.udesc.kanban_backend.task.dto.TaskResponse;
import br.udesc.kanban_backend.task.dto.UpdateTaskRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    private static final Instant NOW = Instant.parse("2026-02-05T10:00:00Z");

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ColumnService columnService;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
        taskService = new TaskService(taskRepository, columnService, clock);
    }

    @Test
    void shouldListTasksFromExistingColumn() {
        BoardColumn column = newColumn();
        KanbanTask first = newTask("Primeira", 0, column);
        KanbanTask second = newTask("Segunda", 1, column);
        when(columnService.findColumn(column.getId())).thenReturn(column);
        when(taskRepository.findByColumn_IdOrderByPositionAsc(column.getId()))
                .thenReturn(List.of(first, second));

        List<TaskResponse> response = taskService.listByColumn(column.getId());

        assertEquals(List.of("Primeira", "Segunda"), response.stream().map(TaskResponse::name).toList());
    }

    @Test
    void shouldRejectListWhenColumnDoesNotExist() {
        UUID columnId = UUID.randomUUID();
        when(columnService.findColumn(columnId)).thenThrow(ResourceNotFoundException.class);

        assertThrows(ResourceNotFoundException.class, () -> taskService.listByColumn(columnId));
    }

    @Test
    void shouldCreateTaskUsingServerTimeAndDefaults() {
        BoardColumn column = newColumn();
        CreateTaskRequest request = new CreateTaskRequest(
                "  Implementar API  ",
                0,
                null,
                NOW.plusSeconds(3600),
                null,
                List.of(" backend ", "spring"),
                column.getId()
        );
        when(columnService.findColumn(column.getId())).thenReturn(column);
        when(taskRepository.save(any(KanbanTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.create(column.getId(), request);

        ArgumentCaptor<KanbanTask> captor = ArgumentCaptor.forClass(KanbanTask.class);
        verify(taskRepository).save(captor.capture());
        assertEquals("Implementar API", response.name());
        assertEquals(NOW, response.createdAt());
        assertFalse(response.completed());
        assertEquals(List.of("backend", "spring"), response.tags());
    }

    @Test
    void shouldAcceptCreatedAtProvidedByCompatibleClient() {
        BoardColumn column = newColumn();
        Instant providedCreatedAt = NOW.minusSeconds(3600);
        CreateTaskRequest request = new CreateTaskRequest(
                "Tarefa",
                0,
                providedCreatedAt,
                NOW,
                true,
                List.of(),
                column.getId()
        );
        when(columnService.findColumn(column.getId())).thenReturn(column);
        when(taskRepository.save(any(KanbanTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.create(column.getId(), request);

        assertEquals(providedCreatedAt, response.createdAt());
        assertTrue(response.completed());
    }

    @Test
    void shouldRejectDifferentColumnIdsInPathAndBody() {
        BoardColumn column = newColumn();
        CreateTaskRequest request = new CreateTaskRequest(
                "Tarefa", 0, null, null, false, List.of(), UUID.randomUUID()
        );

        assertThrows(BadRequestException.class, () -> taskService.create(column.getId(), request));
    }

    @Test
    void shouldRejectDueDateBeforeCreatedAt() {
        BoardColumn column = newColumn();
        CreateTaskRequest request = new CreateTaskRequest(
                "Tarefa",
                0,
                NOW,
                NOW.minusSeconds(1),
                false,
                List.of(),
                column.getId()
        );
        when(columnService.findColumn(column.getId())).thenReturn(column);

        assertThrows(BadRequestException.class, () -> taskService.create(column.getId(), request));
    }

    @Test
    void shouldRejectDuplicatedTags() {
        BoardColumn column = newColumn();
        CreateTaskRequest request = new CreateTaskRequest(
                "Tarefa", 0, NOW, null, false, List.of("backend", "backend"), column.getId()
        );
        when(columnService.findColumn(column.getId())).thenReturn(column);

        assertThrows(BadRequestException.class, () -> taskService.create(column.getId(), request));
    }

    @Test
    void shouldUpdateTaskAndMoveItToAnotherColumn() {
        BoardColumn originalColumn = newColumn();
        BoardColumn destinationColumn = newColumn();
        KanbanTask task = newTask("Tarefa", 0, originalColumn);
        UpdateTaskRequest request = new UpdateTaskRequest(
                "Concluída",
                2,
                task.getCreatedAt(),
                NOW.plusSeconds(7200),
                true,
                List.of("done"),
                destinationColumn.getId()
        );
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));
        when(columnService.findColumn(destinationColumn.getId())).thenReturn(destinationColumn);

        TaskResponse response = taskService.update(task.getId(), request);

        assertEquals("Concluída", response.name());
        assertEquals(2, response.position());
        assertTrue(response.completed());
        assertEquals(destinationColumn.getId(), response.columnId());
        assertEquals(NOW, response.createdAt());
    }

    @Test
    void shouldRejectChangingCreatedAt() {
        BoardColumn column = newColumn();
        KanbanTask task = newTask("Tarefa", 0, column);
        UpdateTaskRequest request = new UpdateTaskRequest(
                "Tarefa",
                0,
                NOW.plusSeconds(1),
                null,
                false,
                List.of(),
                column.getId()
        );
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        assertThrows(BadRequestException.class, () -> taskService.update(task.getId(), request));
    }

    @Test
    void shouldDeleteExistingTask() {
        BoardColumn column = newColumn();
        KanbanTask task = newTask("Tarefa", 0, column);
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        taskService.delete(task.getId());

        verify(taskRepository).delete(task);
    }

    @Test
    void shouldRejectDeleteWhenTaskDoesNotExist() {
        UUID taskId = UUID.randomUUID();
        when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.delete(taskId));
    }

    private BoardColumn newColumn() {
        return new BoardColumn("A fazer", 0, new Board("Projeto"));
    }

    private KanbanTask newTask(String name, int position, BoardColumn column) {
        return new KanbanTask(name, position, NOW, null, false, List.of(), column);
    }
}
