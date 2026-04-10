<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'status'      => ['sometimes', 'in:TODO,IN_PROGRESS,DONE,OVERDUE'],
            'priority'    => ['sometimes', 'in:LOW,MEDIUM,HIGH'],
            'due_date'    => ['required', 'date'],
        ];
    }
}
