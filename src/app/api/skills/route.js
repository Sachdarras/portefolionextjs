import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    if (params?.id) {
      const skill = await prisma.skill.findUnique({
        where: { id: Number(params.id) },
      });
      if (!skill) {
        return NextResponse.json({ error: 'Compétence non trouvée' }, { status: 404 });
      }
      return NextResponse.json(skill);
    } else {
      const skills = await prisma.skill.findMany();
      return NextResponse.json(skills);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des compétences' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newSkill = await prisma.skill.create({ data });
    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la compétence' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params || {};
  try {
    const data = await req.json();
    const updatedSkill = await prisma.skill.update({
      where: { id: Number(id) },
      data,
    });
    return NextResponse.json(updatedSkill);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la compétence' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params || {};
  try {
    await prisma.skill.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Compétence supprimée avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression de la compétence' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const skillsOrder = await req.json();
    if (!Array.isArray(skillsOrder)) {
      return NextResponse.json({ error: 'L\'ordre des compétences doit être un tableau' }, { status: 400 });
    }

    const updates = skillsOrder.map(skill => {
      if (!skill.id || skill.order === undefined) {
        throw new Error('Chaque compétence doit avoir un ID et un ordre défini');
      }
      return prisma.skill.update({
        where: { id: Number(skill.id) },
        data: { order: skill.order },
      });
    });

    await Promise.all(updates);
    return NextResponse.json({ message: 'L\'ordre des compétences a été mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des compétences:', error.message);
    return NextResponse.json({ error: `Erreur lors de la mise à jour de l'ordre des compétences: ${error.message}` }, { status: 500 });
  }
}
