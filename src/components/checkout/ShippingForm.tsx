export interface ShippingFields {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export const EMPTY_SHIPPING: ShippingFields = {
  name: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

interface ShippingFormProps {
  data: ShippingFields;
  onChange: (field: keyof ShippingFields, value: string) => void;
  fieldErrors?: Set<string>;
}

const inputClass = (field: string, fieldErrors?: Set<string>) =>
  `w-full rounded-xl border-0 bg-secondary-50/80 px-4 py-3 text-sm text-secondary-900 ${fieldErrors?.has(field) ? 'ring-1 ring-red-400' : 'ring-1 ring-black/[0.06]'} placeholder:text-secondary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40`;

export default function ShippingForm({ data, onChange, fieldErrors }: ShippingFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="shipping-name" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Full Name
        </label>
        <input
          id="shipping-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          className={inputClass('name', fieldErrors)}
        />
      </div>

      <div>
        <label htmlFor="shipping-email" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Email
        </label>
        <input
          id="shipping-email"
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="john@example.com"
          autoComplete="email"
          className={inputClass('email', fieldErrors)}
        />
      </div>

      <div>
        <label htmlFor="shipping-phone" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Phone <span className="font-normal text-secondary-400">(optional)</span>
        </label>
        <input
          id="shipping-phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          className={inputClass('phone', fieldErrors)}
        />
      </div>

      <div>
        <label htmlFor="shipping-address" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Address
        </label>
        <input
          id="shipping-address"
          type="text"
          value={data.line1}
          onChange={(e) => onChange('line1', e.target.value)}
          placeholder="123 Main St"
          autoComplete="address-line1"
          className={inputClass('line1', fieldErrors)}
        />
      </div>

      <div>
        <label htmlFor="shipping-address2" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Apt, Suite, etc. <span className="font-normal text-secondary-400">(optional)</span>
        </label>
        <input
          id="shipping-address2"
          type="text"
          value={data.line2}
          onChange={(e) => onChange('line2', e.target.value)}
          placeholder="Apt 4B"
          autoComplete="address-line2"
          className={inputClass('line2', fieldErrors)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="shipping-city" className="mb-1.5 block text-sm font-medium text-secondary-700">
            City
          </label>
          <input
            id="shipping-city"
            type="text"
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="Salt Lake City"
            autoComplete="address-level2"
            className={inputClass('city', fieldErrors)}
          />
        </div>
        <div>
          <label htmlFor="shipping-state" className="mb-1.5 block text-sm font-medium text-secondary-700">
            State
          </label>
          <input
            id="shipping-state"
            type="text"
            value={data.state}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="UT"
            autoComplete="address-level1"
            className={inputClass('state', fieldErrors)}
          />
        </div>
        <div>
          <label htmlFor="shipping-zip" className="mb-1.5 block text-sm font-medium text-secondary-700">
            ZIP
          </label>
          <input
            id="shipping-zip"
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="84101"
            autoComplete="postal-code"
            className={inputClass('postalCode', fieldErrors)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="shipping-country" className="mb-1.5 block text-sm font-medium text-secondary-700">
          Country
        </label>
        <input
          id="shipping-country"
          type="text"
          value={data.country}
          onChange={(e) => onChange('country', e.target.value.toUpperCase())}
          placeholder="US"
          autoComplete="country"
          className={inputClass('country', fieldErrors)}
        />
      </div>
    </div>
  );
}
