-- DropForeignKey
ALTER TABLE "public"."window_types_pvcColor" DROP CONSTRAINT "window_types_pvcColor_window_type_id_fkey";

-- AddForeignKey
ALTER TABLE "window_types_pvcColor" ADD CONSTRAINT "window_types_pvcColor_window_type_id_fkey" FOREIGN KEY ("window_type_id") REFERENCES "window_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
