from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .services import OverdueTaskService


class MarkOverdueView(APIView):
    """
    POST /api/tasks/mark-overdue/
    Scans all tasks and marks eligible ones as OVERDUE.
    Called by a scheduler or Laravel cron job.
    """

    def post(self, request):
        service = OverdueTaskService()
        result = service.mark_overdue_tasks()

        return Response({
            'success': True,
            'message': f"{result['marked_overdue']} task(s) marked as OVERDUE.",
            'data': result,
        }, status=status.HTTP_200_OK)


class ValidateTransitionView(APIView):
    """
    POST /api/tasks/<id>/validate-transition/
    Body: { "new_status": "IN_PROGRESS", "is_admin": false }
    Validates if the requested status transition is allowed under overdue rules.
    """

    def post(self, request, task_id):
        try:
            task = Task.objects.get(pk=task_id)
        except Task.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Task not found.',
            }, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('new_status')
        is_admin   = request.data.get('is_admin', False)

        if not new_status:
            return Response({
                'success': False,
                'message': 'new_status is required.',
            }, status=status.HTTP_400_BAD_REQUEST)

        service = OverdueTaskService()
        result  = service.validate_status_transition(task, new_status, is_admin)

        return Response({
            'success': result['allowed'],
            'message': result['reason'] or 'Transition allowed.',
            'data': {
                'task_id':        task.id,
                'current_status': task.status,
                'new_status':     new_status,
                'allowed':        result['allowed'],
            },
        }, status=status.HTTP_200_OK)


class OverdueTasksView(APIView):
    """
    GET /api/tasks/overdue/?project_id=<id>
    Returns all overdue tasks, optionally filtered by project.
    """

    def get(self, request):
        project_id = request.query_params.get('project_id')
        service    = OverdueTaskService()
        tasks      = service.get_overdue_tasks(project_id=project_id)

        return Response({
            'success': True,
            'data':    tasks,
            'count':   len(tasks),
        })
