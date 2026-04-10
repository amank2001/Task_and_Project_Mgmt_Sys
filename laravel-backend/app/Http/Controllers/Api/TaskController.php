<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService) {}

    public function index(Request $request, Project $project): JsonResponse
    {
        $tasks = $this->taskService->getProjectTasks($project, $request->user());

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $task = $this->taskService->createTask(
            $project,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully',
            'data' => $task->load(['assignee', 'creator']),
        ], 201);
    }

    public function show(Project $project, Task $task): JsonResponse
    {
        $task->load(['assignee', 'creator', 'project']);

        return response()->json([
            'success' => true,
            'data' => $task,
        ]);
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $result = $this->taskService->updateTask($task, $request->validated(), $request->user());

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully',
            'data' => $result['task']->load(['assignee', 'creator']),
        ]);
    }

    public function destroy(Project $project, Task $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
    }

    public function myTasks(Request $request): JsonResponse
    {
        $tasks = $this->taskService->getUserTasks($request->user());

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }
}
