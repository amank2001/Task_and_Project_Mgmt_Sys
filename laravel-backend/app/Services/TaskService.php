<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function getProjectTasks(Project $project, User $user): Collection
    {
        $query = $project->tasks()->with(['assignee', 'creator']);

        if (!$user->isAdmin()) {
            $query->where('assigned_to', $user->id);
        }

        return $query->get();
    }

    public function getUserTasks(User $user): Collection
    {
        return Task::with(['project', 'creator'])
            ->where('assigned_to', $user->id)
            ->get();
    }

    public function createTask(Project $project, array $data, User $user): Task
    {
        return Task::create([
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'project_id'  => $project->id,
            'assigned_to' => $data['assigned_to'] ?? null,
            'created_by'  => $user->id,
            'status'      => $data['status'] ?? 'TODO',
            'priority'    => $data['priority'] ?? 'MEDIUM',
            'due_date'    => $data['due_date'],
        ]);
    }

    public function updateTask(Task $task, array $data, User $user): array
    {
        $newStatus = $data['status'] ?? $task->status;

        // Rule: Overdue tasks cannot move back to IN_PROGRESS
        if ($task->status === 'OVERDUE' && $newStatus === 'IN_PROGRESS') {
            return [
                'success' => false,
                'message' => 'Overdue tasks cannot be moved back to IN_PROGRESS.',
            ];
        }

        // Rule: Only admins can close (DONE) overdue tasks
        if ($task->status === 'OVERDUE' && $newStatus === 'DONE' && !$user->isAdmin()) {
            return [
                'success' => false,
                'message' => 'Only admins can close overdue tasks.',
            ];
        }

        // Rule: Members can only update their own assigned tasks
        if (!$user->isAdmin() && $task->assigned_to !== $user->id) {
            return [
                'success' => false,
                'message' => 'You can only update tasks assigned to you.',
            ];
        }

        $task->update($data);

        return [
            'success' => true,
            'task'    => $task->fresh(),
        ];
    }
}
