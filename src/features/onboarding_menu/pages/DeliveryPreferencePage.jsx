// components/onboarding_pages/DeliveryPreferencePage.jsx
export const DeliveryPreferencePage = () => (
    <div className="h-full flex flex-col justify-center p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-[#5A3E36]">Delivery Preferences</h2>
        <div className="space-y-4">
            <select className="w-full px-4 py-2 border-b-2 border-[#EBD8B7] bg-transparent focus:outline-none focus:border-[#D4A373]">
                <option value="">Select delivery time</option>
                <option>Morning (8-12)</option>
                <option>Afternoon (12-4)</option>
                <option>Evening (4-8)</option>
            </select>
            <input
                type="text"
                className="w-full px-4 py-2 border-b-2 border-[#EBD8B7] bg-transparent focus:outline-none focus:border-[#D4A373]"
                placeholder="Special instructions"
            />
        </div>
    </div>
);

