package br.udesc.kanban_backend;

import br.udesc.kanban_backend.board.BoardController;
import br.udesc.kanban_backend.board.BoardService;
import br.udesc.kanban_backend.board.dto.BoardResponse;
import br.udesc.kanban_backend.column.ColumnController;
import br.udesc.kanban_backend.column.ColumnService;
import br.udesc.kanban_backend.column.dto.ColumnResponse;
import br.udesc.kanban_backend.shared.ApiExceptionHandler;
import br.udesc.kanban_backend.task.TaskController;
import br.udesc.kanban_backend.task.TaskService;
import br.udesc.kanban_backend.task.dto.TaskResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ControllerContractTest {

    private static final UUID BOARD_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID COLUMN_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final UUID TASK_ID = UUID.fromString("33333333-3333-3333-3333-333333333333");

    private BoardService boardService;
    private ColumnService columnService;
    private TaskService taskService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        boardService = mock(BoardService.class);
        columnService = mock(ColumnService.class);
        taskService = mock(TaskService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new BoardController(boardService),
                        new ColumnController(columnService),
                        new TaskController(taskService)
                )
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void shouldExposeBoardEndpoints() throws Exception {
        when(boardService.list()).thenReturn(List.of(new BoardResponse(BOARD_ID, "Projeto")));
        when(boardService.create(any())).thenReturn(new BoardResponse(BOARD_ID, "Projeto"));
        when(boardService.update(eq(BOARD_ID), any())).thenReturn(new BoardResponse(BOARD_ID, "Atualizado"));

        mockMvc.perform(get("/api/v1/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(BOARD_ID.toString()))
                .andExpect(jsonPath("$[0].name").value("Projeto"));

        mockMvc.perform(post("/api/v1/board")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Projeto"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(BOARD_ID.toString()));

        mockMvc.perform(put("/api/v1/board/{boardId}", BOARD_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Atualizado"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Atualizado"));

        mockMvc.perform(delete("/api/v1/board/{boardId}", BOARD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        verify(boardService).delete(BOARD_ID);
    }

    @Test
    void shouldExposeColumnEndpoints() throws Exception {
        ColumnResponse created = new ColumnResponse(COLUMN_ID, "A fazer", 0, BOARD_ID);
        ColumnResponse updated = new ColumnResponse(COLUMN_ID, "Fazendo", 1, BOARD_ID);
        when(columnService.listByBoard(BOARD_ID)).thenReturn(List.of(created));
        when(columnService.create(any())).thenReturn(created);
        when(columnService.update(eq(COLUMN_ID), any())).thenReturn(updated);

        mockMvc.perform(get("/api/v1/column/from/{boardId}", BOARD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].position").value(0))
                .andExpect(jsonPath("$[0].boardId").value(BOARD_ID.toString()));

        String createBody = """
                {"name":"A fazer","position":0,"boardId":"%s"}
                """.formatted(BOARD_ID);
        mockMvc.perform(post("/api/v1/column")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(COLUMN_ID.toString()));

        String updateBody = """
                {"name":"Fazendo","position":1,"boardId":"%s"}
                """.formatted(BOARD_ID);
        mockMvc.perform(put("/api/v1/column/{columnId}", COLUMN_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Fazendo"));

        mockMvc.perform(delete("/api/v1/column/{columnId}", COLUMN_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        verify(columnService).delete(COLUMN_ID);
    }

    @Test
    void shouldExposeTaskEndpoints() throws Exception {
        Instant createdAt = Instant.parse("2026-02-05T10:00:00Z");
        Instant dueDate = Instant.parse("2026-02-10T23:59:59Z");
        TaskResponse created = new TaskResponse(
                TASK_ID, "Implementar API", 0, createdAt, dueDate, false,
                List.of("backend"), COLUMN_ID
        );
        TaskResponse updated = new TaskResponse(
                TASK_ID, "Implementar API", 0, createdAt, dueDate, true,
                List.of("backend"), COLUMN_ID
        );
        when(taskService.listByColumn(COLUMN_ID)).thenReturn(List.of(created));
        when(taskService.create(eq(COLUMN_ID), any())).thenReturn(created);
        when(taskService.update(eq(TASK_ID), any())).thenReturn(updated);

        mockMvc.perform(get("/api/v1/task/from/{columnId}", COLUMN_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tags[0]").value("backend"))
                .andExpect(jsonPath("$[0].columnId").value(COLUMN_ID.toString()));

        String createBody = taskBody(false, createdAt, dueDate);
        mockMvc.perform(post("/api/v1/task/from/{columnId}", COLUMN_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TASK_ID.toString()))
                .andExpect(jsonPath("$.completed").value(false));

        String updateBody = taskBody(true, createdAt, dueDate);
        mockMvc.perform(put("/api/v1/task/{taskId}", TASK_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));

        mockMvc.perform(delete("/api/v1/task/{taskId}", TASK_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        verify(taskService).delete(TASK_ID);
    }

    @Test
    void shouldReturnFieldErrorsForInvalidBody() throws Exception {
        mockMvc.perform(post("/api/v1/board")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"  "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.fields.name").value("O nome é obrigatório"));
    }

    private String taskBody(boolean completed, Instant createdAt, Instant dueDate) {
        return """
                {
                  "name":"Implementar API",
                  "position":0,
                  "createdAt":"%s",
                  "dueDate":"%s",
                  "completed":%s,
                  "tags":["backend"],
                  "columnId":"%s"
                }
                """.formatted(createdAt, dueDate, completed, COLUMN_ID);
    }
}
