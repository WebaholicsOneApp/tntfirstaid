import { US_STATES } from "~/lib/us-states";

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
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

interface ShippingFormProps {
  data: ShippingFields;
  onChange: (field: keyof ShippingFields, value: string) => void;
  fieldErrors?: Map<string, string>;
}

const inputClass = (field: string, fieldErrors?: Map<string, string>) =>
  `w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-secondary-900 transition-all ${fieldErrors?.has(field) ? "ring-1 ring-red-400" : "ring-1 ring-secondary-200 hover:ring-secondary-300"} placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500`;

const selectClass = (field: string, fieldErrors?: Map<string, string>) =>
  `${inputClass(field, fieldErrors)} cursor-pointer appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`;

const chevronBg = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475467' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
};

const COUNTRY_OPTIONS = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
];

export default function ShippingForm({
  data,
  onChange,
  fieldErrors,
}: ShippingFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="shipping-name"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Full Name
        </label>
        <input
          id="shipping-name"
          type="text"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="John Doe"
          autoComplete="name"
          className={inputClass("name", fieldErrors)}
        />
        {fieldErrors?.has("name") && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.get("name")}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="shipping-email"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Email
        </label>
        <input
          id="shipping-email"
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="john@example.com"
          autoComplete="email"
          className={inputClass("email", fieldErrors)}
        />
        {fieldErrors?.has("email") && (
          <p className="mt-1 text-sm text-red-500">
            {fieldErrors.get("email")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="shipping-phone"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Phone{" "}
          <span className="text-secondary-400 font-normal">(optional)</span>
        </label>
        <input
          id="shipping-phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="(555) 123-4567"
          autoComplete="tel"
          className={inputClass("phone", fieldErrors)}
        />
      </div>

      <div>
        <label
          htmlFor="shipping-address"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Address
        </label>
        <input
          id="shipping-address"
          type="text"
          value={data.line1}
          onChange={(e) => onChange("line1", e.target.value)}
          placeholder="123 Main St"
          autoComplete="address-line1"
          className={inputClass("line1", fieldErrors)}
        />
        {fieldErrors?.has("line1") && (
          <p className="mt-1 text-sm text-red-500">
            {fieldErrors.get("line1")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="shipping-address2"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Apt, Suite, etc.{" "}
          <span className="text-secondary-400 font-normal">(optional)</span>
        </label>
        <input
          id="shipping-address2"
          type="text"
          value={data.line2}
          onChange={(e) => onChange("line2", e.target.value)}
          placeholder="Apt 4B"
          autoComplete="address-line2"
          className={inputClass("line2", fieldErrors)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="shipping-city"
            className="text-secondary-700 mb-1.5 block text-sm font-medium"
          >
            City
          </label>
          <input
            id="shipping-city"
            type="text"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Salt Lake City"
            autoComplete="address-level2"
            className={inputClass("city", fieldErrors)}
          />
          {fieldErrors?.has("city") && (
            <p className="mt-1 text-sm text-red-500">
              {fieldErrors.get("city")}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="shipping-state"
            className="text-secondary-700 mb-1.5 block text-sm font-medium"
          >
            State
          </label>
          <select
            id="shipping-state"
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
            autoComplete="address-level1"
            className={selectClass("state", fieldErrors)}
            style={chevronBg}
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.abbr} — {s.name}
              </option>
            ))}
          </select>
          {fieldErrors?.has("state") && (
            <p className="mt-1 text-sm text-red-500">
              {fieldErrors.get("state")}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="shipping-zip"
            className="text-secondary-700 mb-1.5 block text-sm font-medium"
          >
            ZIP
          </label>
          <input
            id="shipping-zip"
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange("postalCode", e.target.value)}
            placeholder="84101"
            autoComplete="postal-code"
            className={inputClass("postalCode", fieldErrors)}
          />
          {fieldErrors?.has("postalCode") && (
            <p className="mt-1 text-sm text-red-500">
              {fieldErrors.get("postalCode")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="shipping-country"
          className="text-secondary-700 mb-1.5 block text-sm font-medium"
        >
          Country
        </label>
        <select
          id="shipping-country"
          value={data.country || "US"}
          onChange={(e) => onChange("country", e.target.value)}
          autoComplete="country"
          className={selectClass("country", fieldErrors)}
          style={chevronBg}
        >
          {COUNTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
