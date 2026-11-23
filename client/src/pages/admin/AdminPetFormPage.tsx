import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ErrorAlert } from "../../components/ui/ErrorAlert";
import { ArrowLeftIcon } from "../../components/ui/Icons";
import { PetForm, emptyPetForm, toFormValues } from "../../features/pets/components/PetForm";
import { useCreatePet, usePet, useUpdatePet } from "../../features/pets/petApi";
import { useToastStore } from "../../stores/toastStore";
import type { PetInput } from "../../types/models";

/** หน้าเพิ่ม (/admin/pets/new) และแก้ไข (/admin/pets/:id/edit) ใช้ฟอร์มเดียวกัน */
export function AdminPetFormPage(): ReactElement {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const petId = Number(id);

  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.show);
  const petQuery = usePet(isEdit ? petId : 0);
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const mutation = isEdit ? updatePet : createPet;

  const goBack = (): void => {
    void navigate("/admin/pets");
  };

  const handleSubmit = (input: PetInput): void => {
    if (isEdit) {
      updatePet.mutate(
        { id: petId, input },
        {
          onSuccess: (pet) => {
            showToast("success", `บันทึกข้อมูล "${pet.name}" เรียบร้อยแล้ว`);
            goBack();
          },
        },
      );
    } else {
      createPet.mutate(input, {
        onSuccess: (pet) => {
          showToast("success", `เพิ่ม "${pet.name}" เข้าสู่ระบบแล้ว`);
          goBack();
        },
      });
    }
  };

  let content: ReactElement;
  if (isEdit && petQuery.isLoading) {
    content = <div className="skeleton h-96 w-full" />;
  } else if (isEdit && (petQuery.isError || !petQuery.data)) {
    content = <ErrorAlert error={petQuery.error} onRetry={() => void petQuery.refetch()} />;
  } else {
    content = (
      <PetForm
        key={petQuery.data?.id ?? "new"}
        initialValues={isEdit && petQuery.data ? toFormValues(petQuery.data) : emptyPetForm}
        submitLabel={isEdit ? "บันทึกการแก้ไข" : "เพิ่มสัตว์"}
        isSubmitting={mutation.isPending}
        submitError={mutation.error}
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/admin/pets" className="btn btn-ghost btn-sm btn-square" aria-label="กลับ">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <h2 className="text-xl font-bold">
          {isEdit ? `แก้ไขข้อมูล${petQuery.data ? ` "${petQuery.data.name}"` : ""}` : "เพิ่มสัตว์ใหม่"}
        </h2>
      </div>
      <div className="rounded-box border border-base-300 bg-base-100 p-4 sm:p-6">{content}</div>
    </section>
  );
}
