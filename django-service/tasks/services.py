from datetime import date
from .models import Task


class OverdueTaskService:
    """
    Handles all overdue task business logic as required by the assignment.

    Rules:
      1. Tasks with due_date in the past and status != DONE → mark as OVERDUE
      2. Overdue tasks cannot move back to IN_PROGRESS
      3. Only Admin can close (DONE) overdue tasks
    """

    def mark_overdue_tasks(self) -> dict:
        """
        Scans all tasks and marks eligible ones as OVERDUE.
        Returns a summary of changes made.
        """
        today = date.today()

        eligible = Task.objects.filter(
            due_date__lt=today,
        ).exclude(
            status__in=[Task.STATUS_DONE, Task.STATUS_OVERDUE]
        )

        count = eligible.count()
        eligible.update(status=Task.STATUS_OVERDUE)

        return {
            'marked_overdue': count,
            'run_date': str(today),
        }

    def validate_status_transition(self, task: Task, new_status: str, is_admin: bool) -> dict:
        """
        Validates whether a status transition is allowed.
        Returns {'allowed': bool, 'reason': str}
        """
        # Rule 2: Overdue → IN_PROGRESS is forbidden
        if task.status == Task.STATUS_OVERDUE and new_status == Task.STATUS_IN_PROGRESS:
            return {
                'allowed': False,
                'reason': 'Overdue tasks cannot be moved back to IN_PROGRESS.',
            }

        # Rule 3: Only admin can close overdue tasks
        if task.status == Task.STATUS_OVERDUE and new_status == Task.STATUS_DONE and not is_admin:
            return {
                'allowed': False,
                'reason': 'Only admins can close overdue tasks.',
            }

        return {'allowed': True, 'reason': None}

    def get_overdue_tasks(self, project_id: int = None) -> list:
        """Returns all currently overdue tasks, optionally filtered by project."""
        qs = Task.objects.filter(status=Task.STATUS_OVERDUE)
        if project_id:
            qs = qs.filter(project_id=project_id)
        return list(qs.values())
