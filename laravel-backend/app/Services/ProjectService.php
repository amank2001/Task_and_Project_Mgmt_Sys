<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function getAllProjects(User $user): Collection
    {
        if ($user->isAdmin()) {
            return Project::with(['creator', 'tasks'])->get();
        }

        // Members see projects that have tasks assigned to them
        return Project::with(['creator', 'tasks'])
            ->whereHas('tasks', fn ($q) => $q->where('assigned_to', $user->id))
            ->get();
    }

    public function createProject(array $data, User $user): Project
    {
        return Project::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'created_by'  => $user->id,
        ]);
    }

    public function updateProject(Project $project, array $data): Project
    {
        $project->update($data);
        return $project->fresh();
    }
}
