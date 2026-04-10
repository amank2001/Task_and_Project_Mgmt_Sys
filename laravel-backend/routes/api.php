<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);
    });

    // My Tasks (member shortcut)
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);

    // Projects
    Route::apiResource('projects', ProjectController::class);

    // Tasks (nested under projects)
    Route::prefix('projects/{project}/tasks')->group(function () {
        Route::get('/',          [TaskController::class, 'index']);
        Route::post('/',         [TaskController::class, 'store']);
        Route::get('/{task}',    [TaskController::class, 'show']);
        Route::put('/{task}',    [TaskController::class, 'update']);
        Route::patch('/{task}',  [TaskController::class, 'update']);
        Route::delete('/{task}', [TaskController::class, 'destroy']);
    });
});
