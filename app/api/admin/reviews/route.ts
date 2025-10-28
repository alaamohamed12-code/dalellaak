import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

// GET - Get all reviews with company info
export async function GET(request: NextRequest) {
  try {
    const db = new Database(dbPath);

    const reviews = db.prepare(`
      SELECT 
        r.*,
        c.firstName as companyName,
        c.email as companyEmail,
        c.image as companyImage
      FROM company_reviews r
      LEFT JOIN companies c ON r.companyId = c.id
      ORDER BY r.createdAt DESC
    `).all();

    db.close();

    return NextResponse.json({ reviews });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'فشل في جلب التقييمات' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'معرف التقييم مطلوب' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Get review to get companyId
    const review: any = db.prepare(`
      SELECT companyId 
      FROM company_reviews 
      WHERE id = ?
    `).get(reviewId);

    if (!review) {
      db.close();
      return NextResponse.json(
        { error: 'التقييم غير موجود' },
        { status: 404 }
      );
    }

    // Delete review
    db.prepare('DELETE FROM company_reviews WHERE id = ?').run(reviewId);

    // Update company rating
    const stats: any = db.prepare(`
      SELECT 
        AVG(rating) as avgRating,
        COUNT(*) as count
      FROM company_reviews
      WHERE companyId = ?
    `).get(review.companyId);

    db.prepare(`
      UPDATE companies 
      SET rating = ?, reviewCount = ?
      WHERE id = ?
    `).run(stats.avgRating || 0, stats.count || 0, review.companyId);

    db.close();

    return NextResponse.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'فشل في حذف التقييم' },
      { status: 500 }
    );
  }
}
