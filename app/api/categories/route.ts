import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const token = req.headers.get("authorization")?.split(" ")[1] || null;

    const categoryData = {
      name: formData.get("name"),
      type: formData.get("type"),
    };

    const bodyFormData = new FormData();
    bodyFormData.append("name", categoryData.name as string);
    bodyFormData.append("type", categoryData.type as string);

    const file = formData.get("file") as File | null;
    if (file) {
      bodyFormData.append("file", file);
    }

    const componentCategoriesString = formData.get("componentCategories") as
      | string
      | null;
    if (componentCategoriesString) {
      const componentCategories = JSON.parse(
        componentCategoriesString
      ) as string[];
      componentCategories.forEach((category: string, index) => {
        bodyFormData.append(`componentCategories[${index}][id]`, category);
      });
    }

    const response = await fetch(`${process.env.API_URL}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: bodyFormData,
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json(
        { message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1] || null;

    const response = await fetch(`${process.env.API_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const token = req.headers.get("authorization")?.split(" ")[1] || null;

    const categoryData = {
      id: formData.get("id"),
      name: formData.get("name"),
      type: formData.get("type"),
    };

    const bodyFormData = new FormData();
    bodyFormData.append("id", categoryData.id as string);
    bodyFormData.append("name", categoryData.name as string);
    bodyFormData.append("type", categoryData.type as string);

    const file = formData.get("file") as File | null;
    if (file) {
      bodyFormData.append("file", file);
    }

    const componentCategoriesString = formData.get("componentCategories") as
      | string
      | null;
    if (componentCategoriesString) {
      const componentCategories = JSON.parse(
        componentCategoriesString
      ) as string[];
      componentCategories.forEach((category: string, index) => {
        bodyFormData.append(`componentCategories[${index}][id]`, category);
      });
    }

    const response = await fetch(`${process.env.API_URL}/categories`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: bodyFormData,
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json(
        { message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const token = req.headers.get("authorization")?.split(" ")[1] || null;

    const response = await fetch(`${process.env.API_URL}/categories?id=${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return NextResponse.json(
        { message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
