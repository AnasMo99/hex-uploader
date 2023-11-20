/*
  Warnings:

  - You are about to drop the column `hexfile` on the `Hex` table. All the data in the column will be lost.
  - Added the required column `file` to the `Hex` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hex" DROP COLUMN "hexfile",
ADD COLUMN     "file" JSONB NOT NULL;
