<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Facades\Http;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     * Calls the Django microservice every hour to mark overdue tasks.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            $djangoUrl = config('services.django.url', env('DJANGO_SERVICE_URL', 'http://localhost:8001'));
            try {
                Http::post("{$djangoUrl}/api/tasks/mark-overdue/");
            } catch (\Exception $e) {
                \Log::error('Django overdue sync failed: ' . $e->getMessage());
            }
        })->hourly()->name('sync-overdue-tasks');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
