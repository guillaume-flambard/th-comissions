<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQRCodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'partner_id' => 'required|exists:partners,id',
            'campaign_name' => 'nullable|string|max:100',
            'size' => 'required|in:256,512,1024',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'partner_id.required' => 'กรุณาเลือกพาร์ทเนอร์',
            'partner_id.exists' => 'พาร์ทเนอร์ที่เลือกไม่ถูกต้อง',
            'size.required' => 'กรุณาเลือกขนาด QR Code',
            'size.in' => 'ขนาด QR Code ต้องเป็น 256, 512 หรือ 1024 เท่านั้น',
        ];
    }
}
