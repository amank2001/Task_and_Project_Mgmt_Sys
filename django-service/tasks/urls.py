from django.urls import path
from .views import MarkOverdueView, ValidateTransitionView, OverdueTasksView

urlpatterns = [
    path('tasks/mark-overdue/',                    MarkOverdueView.as_view(),        name='mark-overdue'),
    path('tasks/overdue/',                         OverdueTasksView.as_view(),        name='overdue-tasks'),
    path('tasks/<int:task_id>/validate-transition/', ValidateTransitionView.as_view(), name='validate-transition'),
]
