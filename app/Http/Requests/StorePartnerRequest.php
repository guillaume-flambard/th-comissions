<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePartnerRequest extends FormRequest
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
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|in:dive_shop,kite_school,hostel,hotel,tour_operator,transfer_service',
            'contact_name' => 'required|string|max:255',
            'email' => 'required|email|unique:partners,email',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:2',
            'website' => 'nullable|url',
            'promptpay_id' => 'nullable|string|max:100',
            'default_commission_rate' => 'required|numeric|min:0|max:100',
            'commission_structure' => 'required|in:percentage,fixed,tiered',
            'fixed_commission_amount' => 'required_if:commission_structure,fixed|nullable|numeric|min:0',
            'tiered_commission_rules' => 'nullable|array',
            'payment_method' => 'nullable|string',
            'payment_currency' => 'nullable|string|in:THB,USD,EUR',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_name' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'business_name.required' => 'กรุณากรอกชื่อธุรกิจ (Business name is required)',
            'business_type.required' => 'กรุณาเลือกประเภทธุรกิจ (Business type is required)',
            'business_type.in' => 'ประเภทธุรกิจไม่ถูกต้อง (Invalid business type)',
            'contact_name.required' => 'กรุณากรอกชื่อผู้ติดต่อ (Contact name is required)',
            'email.required' => 'กรุณากรอกอีเมล (Email is required)',
            'email.email' => 'รูปแบบอีเมลไม่ถูกต้อง (Invalid email format)',
            'email.unique' => 'อีเมลนี้ถูกใช้งานแล้ว (This email is already in use)',
            'phone.required' => 'กรุณากรอกเบอร์โทรศัพท์ (Phone number is required)',
            'default_commission_rate.required' => 'กรุณากรอกอัตราค่าคอมมิชชั่น (Commission rate is required)',
            'default_commission_rate.min' => 'อัตราค่าคอมมิชชั่นต้องมากกว่าหรือเท่ากับ 0 (Commission rate must be at least 0)',
            'default_commission_rate.max' => 'อัตราค่าคอมมิชชั่นต้องไม่เกิน 100 (Commission rate cannot exceed 100)',
            'commission_structure.required' => 'กรุณาเลือกโครงสร้างค่าคอมมิชชั่น (Commission structure is required)',
            'commission_structure.in' => 'โครงสร้างค่าคอมมิชชั่นไม่ถูกต้อง (Invalid commission structure)',
            'fixed_commission_amount.required_if' => 'กรุณากรอกจำนวนค่าคอมมิชชั่นคงที่ (Fixed commission amount is required)',
        ];
    }
}
