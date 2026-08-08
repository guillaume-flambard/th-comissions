<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReferralRequest extends FormRequest
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
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email',
            'customer_phone' => 'nullable|string|max:20',
            'service_type' => 'required|string|in:diving,kite_lesson,transfer,tour,accommodation',
            'service_amount' => 'required|numeric|min:0',
            'referring_partner_id' => 'required|exists:partners,id',
            'receiving_partner_id' => 'required|exists:partners,id',
            'booking_date' => 'required|date',
            'service_date' => 'nullable|date|after:booking_date',
            'service_description' => 'nullable|string',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'กรุณากรอกชื่อลูกค้า',
            'customer_email.email' => 'รูปแบบอีเมลไม่ถูกต้อง',
            'service_type.required' => 'กรุณาเลือกประเภทบริการ',
            'service_type.in' => 'ประเภทบริการไม่ถูกต้อง',
            'service_amount.required' => 'กรุณากรอกยอดบริการ',
            'service_amount.min' => 'ยอดบริการต้องมากกว่า 0',
            'referring_partner_id.required' => 'กรุณาเลือกพาร์ทเนอร์ผู้แนะนำ',
            'referring_partner_id.exists' => 'พาร์ทเนอร์ผู้แนะนำไม่ถูกต้อง',
            'receiving_partner_id.required' => 'กรุณาเลือกพาร์ทเนอร์ผู้รับ',
            'receiving_partner_id.exists' => 'พาร์ทเนอร์ผู้รับไม่ถูกต้อง',
            'booking_date.required' => 'กรุณาเลือกวันที่จอง',
            'service_date.after' => 'วันที่ใช้บริการต้องหลังจากวันที่จอง',
        ];
    }
}
