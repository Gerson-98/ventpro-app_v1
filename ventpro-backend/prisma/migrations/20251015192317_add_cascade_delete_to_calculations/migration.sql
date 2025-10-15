-- DropForeignKey
ALTER TABLE "public"."window_calculations" DROP CONSTRAINT "window_calculations_window_type_id_fkey";

-- AddForeignKey
ALTER TABLE "window_calculations" ADD CONSTRAINT "window_calculations_window_type_id_fkey" FOREIGN KEY ("window_type_id") REFERENCES "window_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
