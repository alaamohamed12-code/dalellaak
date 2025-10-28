import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'companies.db');

// GET - Get reviews for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'معرف الشركة مطلوب' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Get all reviews for the company
    const reviews = db.prepare(`
      SELECT 
        id,
        userId,
        userFirstName,
        userLastName,
        rating,
        comment,
        createdAt
      FROM company_reviews
      WHERE companyId = ?
      ORDER BY createdAt DESC
    `).all(companyId);

    // Get company rating stats
    const stats: any = db.prepare(`
      SELECT 
        AVG(rating) as avgRating,
        COUNT(*) as totalReviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar
      FROM company_reviews
      WHERE companyId = ?
    `).get(companyId);

    db.close();

    return NextResponse.json({
      reviews,
      stats: {
        avgRating: stats.avgRating ? Number(stats.avgRating.toFixed(1)) : 0,
        totalReviews: stats.totalReviews || 0,
        distribution: {
          5: stats.fiveStars || 0,
          4: stats.fourStars || 0,
          3: stats.threeStars || 0,
          2: stats.twoStars || 0,
          1: stats.oneStar || 0,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'فشل في جلب التقييمات' },
      { status: 500 }
    );
  }
}

// POST - Add a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, userId, userFirstName, userLastName, rating, comment } = body;

    // Validation
    if (!companyId || !userId || !rating) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب ملؤها' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Check if user already reviewed this company
    const existingReview = db.prepare(`
      SELECT id FROM company_reviews 
      WHERE companyId = ? AND userId = ?
    `).get(companyId, userId);

    if (existingReview) {
      db.close();
      return NextResponse.json(
        { error: 'لقد قمت بتقييم هذه الشركة من قبل' },
        { status: 409 }
      );
    }

    // Insert new review
    const result = db.prepare(`
      INSERT INTO company_reviews (companyId, userId, userFirstName, userLastName, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(companyId, userId, userFirstName || '', userLastName || '', rating, comment || '');

    // Update company rating
    const stats: any = db.prepare(`
      SELECT 
        AVG(rating) as avgRating,
        COUNT(*) as count
      FROM company_reviews
      WHERE companyId = ?
    `).get(companyId);

    db.prepare(`
      UPDATE companies 
      SET rating = ?, reviewCount = ?
      WHERE id = ?
    `).run(stats.avgRating, stats.count, companyId);

    db.close();

    return NextResponse.json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      reviewId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json(
      { error: 'فشل في إضافة التقييم' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: 'معرف التقييم ومعرف المستخدم مطلوبان' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Get review to check ownership and get companyId
    const review: any = db.prepare(`
      SELECT companyId, userId as reviewUserId 
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

    // Check if user owns this review
    if (review.reviewUserId !== parseInt(userId)) {
      db.close();
      return NextResponse.json(
        { error: 'غير مصرح لك بحذف هذا التقييم' },
        { status: 403 }
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
