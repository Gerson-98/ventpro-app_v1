-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glassColor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "glassColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "window_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "window_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "window_calculations" (
    "id" SERIAL NOT NULL,
    "window_type_id" INTEGER NOT NULL,
    "hojaDivision" TEXT NOT NULL,
    "hojaMargen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hojaDescuento" DOUBLE PRECISION NOT NULL,
    "vidrioDescuento" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "window_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pvcColor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "pvcColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "window_types_pvcColor" (
    "id" SERIAL NOT NULL,
    "window_type_id" INTEGER NOT NULL,
    "pvcColor_id" INTEGER NOT NULL,

    CONSTRAINT "window_types_pvcColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "project" TEXT NOT NULL,
    "status" TEXT,
    "total" DOUBLE PRECISION,
    "clientId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "windows" (
    "id" SERIAL NOT NULL,
    "width_cm" DOUBLE PRECISION NOT NULL,
    "height_cm" DOUBLE PRECISION NOT NULL,
    "hojaAncho" DOUBLE PRECISION,
    "hojaAlto" DOUBLE PRECISION,
    "vidrioAncho" DOUBLE PRECISION,
    "vidrioAlto" DOUBLE PRECISION,
    "order_id" INTEGER,
    "window_type_id" INTEGER,
    "color_id" INTEGER,
    "glass_color_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_perfiles" (
    "id" SERIAL NOT NULL,
    "tipo_ventana" VARCHAR(255) NOT NULL,
    "perfil_marco" VARCHAR(255),
    "perfil_hoja" VARCHAR(255),
    "perfil_mosquitero" VARCHAR(255),
    "perfil_batiente" VARCHAR(255),
    "perfil_tapajamba" VARCHAR(255),
    "regla_marco" TEXT,
    "regla_hoja" TEXT,
    "regla_mosquitero" TEXT,
    "regla_batiente" TEXT,
    "regla_tapajamba" TEXT,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "window_calculations_window_type_id_key" ON "window_calculations"("window_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "window_types_pvcColor_window_type_id_pvcColor_id_key" ON "window_types_pvcColor"("window_type_id", "pvcColor_id");

-- AddForeignKey
ALTER TABLE "window_calculations" ADD CONSTRAINT "window_calculations_window_type_id_fkey" FOREIGN KEY ("window_type_id") REFERENCES "window_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "window_types_pvcColor" ADD CONSTRAINT "window_types_pvcColor_window_type_id_fkey" FOREIGN KEY ("window_type_id") REFERENCES "window_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "window_types_pvcColor" ADD CONSTRAINT "window_types_pvcColor_pvcColor_id_fkey" FOREIGN KEY ("pvcColor_id") REFERENCES "pvcColor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "pvcColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_glass_color_id_fkey" FOREIGN KEY ("glass_color_id") REFERENCES "glassColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "windows" ADD CONSTRAINT "windows_window_type_id_fkey" FOREIGN KEY ("window_type_id") REFERENCES "window_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
