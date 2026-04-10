<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@example.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Create Members
        $alice = User::create([
            'name'     => 'Alice Johnson',
            'email'    => 'alice@example.com',
            'password' => Hash::make('password'),
            'role'     => 'member',
        ]);

        $bob = User::create([
            'name'     => 'Bob Smith',
            'email'    => 'bob@example.com',
            'password' => Hash::make('password'),
            'role'     => 'member',
        ]);

        // Create Projects
        $project1 = Project::create([
            'name'        => 'Website Redesign',
            'description' => 'Complete overhaul of the company website.',
            'created_by'  => $admin->id,
        ]);

        $project2 = Project::create([
            'name'        => 'Mobile App MVP',
            'description' => 'Build the first version of the mobile application.',
            'created_by'  => $admin->id,
        ]);

        // Create Tasks
        Task::insert([
            [
                'title'       => 'Design wireframes',
                'description' => 'Create initial wireframes for all pages.',
                'project_id'  => $project1->id,
                'assigned_to' => $alice->id,
                'created_by'  => $admin->id,
                'status'      => 'IN_PROGRESS',
                'priority'    => 'HIGH',
                'due_date'    => now()->addDays(7),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'title'       => 'Write API documentation',
                'description' => 'Document all backend endpoints.',
                'project_id'  => $project1->id,
                'assigned_to' => $bob->id,
                'created_by'  => $admin->id,
                'status'      => 'TODO',
                'priority'    => 'MEDIUM',
                'due_date'    => now()->addDays(14),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'title'       => 'Fix login bug',
                'description' => 'Users cannot log in on Safari.',
                'project_id'  => $project1->id,
                'assigned_to' => $alice->id,
                'created_by'  => $admin->id,
                'status'      => 'OVERDUE',
                'priority'    => 'HIGH',
                'due_date'    => now()->subDays(3),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'title'       => 'Set up CI/CD pipeline',
                'description' => 'Automate testing and deployments.',
                'project_id'  => $project2->id,
                'assigned_to' => $bob->id,
                'created_by'  => $admin->id,
                'status'      => 'TODO',
                'priority'    => 'HIGH',
                'due_date'    => now()->addDays(5),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'title'       => 'User authentication flow',
                'description' => 'Implement login/signup screens in the app.',
                'project_id'  => $project2->id,
                'assigned_to' => $alice->id,
                'created_by'  => $admin->id,
                'status'      => 'IN_PROGRESS',
                'priority'    => 'HIGH',
                'due_date'    => now()->addDays(10),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }
}
