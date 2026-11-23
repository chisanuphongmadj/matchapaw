import type { ReactElement } from "react";
import { SearchIcon } from "../../../components/ui/Icons";
import { genderLabel, isOneOf, petStatusMeta, sizeLabel, sortLabel } from "../../../lib/format";
import { defaultFilters, useFilterStore } from "../../../stores/filterStore";
import { GENDERS, PET_SIZES, PET_SORTS, PET_STATUSES } from "../../../types/models";
import { useSpecies } from "../../meta/metaApi";

/** แถบค้นหาและตัวกรอง - อ่าน/เขียนค่าใน Zustand (filterStore) */
export function PetFilters(): ReactElement {
  const filters = useFilterStore((state) => state.filters);
  const setFilter = useFilterStore((state) => state.setFilter);
  const reset = useFilterStore((state) => state.reset);
  const { data: species } = useSpecies();

  const isDirty = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <label className="input col-span-2 w-full md:col-span-3 lg:col-span-2">
          <SearchIcon className="size-4 opacity-60" />
          <input
            type="search"
            placeholder="ค้นหาชื่อ สายพันธุ์ หรือสี..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            aria-label="ค้นหาสัตว์"
          />
        </label>

        <select
          className="select w-full"
          aria-label="ชนิดสัตว์"
          value={filters.speciesId ?? ""}
          onChange={(e) => setFilter("speciesId", e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">ทุกชนิด</option>
          {species?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="select w-full"
          aria-label="เพศ"
          value={filters.gender ?? ""}
          onChange={(e) => setFilter("gender", isOneOf(GENDERS, e.target.value) ? e.target.value : null)}
        >
          <option value="">ทุกเพศ</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {genderLabel[g]}
            </option>
          ))}
        </select>

        <select
          className="select w-full"
          aria-label="ขนาด"
          value={filters.size ?? ""}
          onChange={(e) => setFilter("size", isOneOf(PET_SIZES, e.target.value) ? e.target.value : null)}
        >
          <option value="">ทุกขนาด</option>
          {PET_SIZES.map((s) => (
            <option key={s} value={s}>
              ขนาด{sizeLabel[s]}
            </option>
          ))}
        </select>

        <select
          className="select w-full"
          aria-label="สถานะ"
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilter("status", isOneOf(PET_STATUSES, e.target.value) ? e.target.value : null)
          }
        >
          <option value="">ทุกสถานะ</option>
          {PET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {petStatusMeta[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-base-content/70">เรียงตาม</span>
          <select
            className="select select-sm w-auto"
            value={filters.sort}
            onChange={(e) => {
              if (isOneOf(PET_SORTS, e.target.value)) setFilter("sort", e.target.value);
            }}
          >
            {PET_SORTS.map((s) => (
              <option key={s} value={s}>
                {sortLabel[s]}
              </option>
            ))}
          </select>
        </label>
        {isDirty && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            ล้างตัวกรอง
          </button>
        )}
      </div>
    </div>
  );
}
