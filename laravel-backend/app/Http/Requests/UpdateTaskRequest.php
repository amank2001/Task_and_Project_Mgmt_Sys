<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Both admin and member can attempt; service layer enforces ownership
        return true;
    }

    public function rules(): array
    {
        $isAdmin = $this->user()->isAdmin();

        $rules = [
            'status'   => ['sometimes', 'in:TODO,IN_PROGRESS,DONE,OVERDUE'],
        ];

        if ($isAdmin) {
            $rules['title']       = ['sometimes', 'string', 'max:255'];
            $rules['description'] = ['nullable', 'string'];
            $rules['assigned_to'] = ['nullable', 'exists:users,id'];
            $rules['priority']    = ['sometimes', 'in:LOW,MEDIUM,HIGH'];
            $rules['due_date']    = ['sometimes', 'date'];
        }

        return $rules;
    }
}
