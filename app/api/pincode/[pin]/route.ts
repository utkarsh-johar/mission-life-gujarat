import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { pin: string } }
) {
  const pin = params.pin?.trim();

  if (!pin || !/^3[6-9]\d{4}$/.test(pin)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_GUJARAT_PINCODE",
          message: "PIN code must be a 6-digit Gujarat postal code starting with 36-39.",
        },
      },
      { status: 400 }
    );
  }

  try {
    const pinRecord = await prisma.pincodeMap.findUnique({
      where: { pincode: pin },
    });

    if (pinRecord) {
      const ward = pinRecord.wardId
        ? await prisma.ward.findUnique({ where: { id: pinRecord.wardId } })
        : null;

      return NextResponse.json({
        pincode: pin,
        city: pinRecord.city,
        district: pinRecord.district,
        discom: pinRecord.discom,
        wardId: pinRecord.wardId,
        wardName: ward?.name,
        verified: pinRecord.verified,
      });
    }

    // Fallback: If not in exact pin map, derive city & DISCOM by pin prefix
    let derivedCity = "Ahmedabad";
    let derivedDiscom = "UGVCL";

    if (pin.startsWith("380") || pin.startsWith("382")) {
      derivedCity = pin.startsWith("3820") ? "Gandhinagar" : "Ahmedabad";
      derivedDiscom = pin.startsWith("380") ? "TORRENT_POWER" : "UGVCL";
    } else if (pin.startsWith("395") || pin.startsWith("394")) {
      derivedCity = "Surat";
      derivedDiscom = pin.startsWith("395") ? "TORRENT_POWER" : "DGVCL";
    } else if (pin.startsWith("390") || pin.startsWith("391")) {
      derivedCity = "Vadodara";
      derivedDiscom = "MGVCL";
    } else if (pin.startsWith("360") || pin.startsWith("361")) {
      derivedCity = "Rajkot";
      derivedDiscom = "PGVCL";
    }

    return NextResponse.json({
      pincode: pin,
      city: derivedCity,
      district: derivedCity,
      discom: derivedDiscom,
      wardId: null,
      wardName: null,
      verified: false,
      note: "Derived from postal prefix mapping. User may override DISCOM.",
    });
  } catch (error) {
    console.error("Pincode lookup error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to resolve PIN code" } },
      { status: 500 }
    );
  }
}
