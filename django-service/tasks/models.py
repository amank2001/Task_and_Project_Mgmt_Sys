from django.db import models


class Task(models.Model):
    STATUS_TODO        = 'TODO'
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_DONE        = 'DONE'
    STATUS_OVERDUE     = 'OVERDUE'

    STATUS_CHOICES = [
        (STATUS_TODO,        'Todo'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE,        'Done'),
        (STATUS_OVERDUE,     'Overdue'),
    ]

    PRIORITY_CHOICES = [
        ('LOW',    'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH',   'High'),
    ]

    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    project_id  = models.IntegerField()
    assigned_to = models.IntegerField(null=True, blank=True)
    created_by  = models.IntegerField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    priority    = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    due_date    = models.DateField()
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'tasks'
        managed   = False   # Laravel owns this table

    def __str__(self):
        return self.title
