import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const companiesDbPath = path.join(process.cwd(), 'companies.db');

export async function POST(request: Request) {
  try {
    const { companyId, days } = await request.json();

    if (!companyId || !days) {
      return NextResponse.json({ error: 'Company ID and days are required' }, { status: 400 });
    }

    // Validate days
    if (![30, 90, 365].includes(days)) {
      return NextResponse.json({ error: 'Invalid renewal period' }, { status: 400 });
    }

    const companiesDb = new Database(companiesDbPath);

    // Get current company data
    const company = companiesDb.prepare(`
      SELECT id, membershipStatus, membershipExpiry 
      FROM companies 
      WHERE id = ?
    `).get(companyId) as { id: number; membershipStatus: string; membershipExpiry: string | null } | undefined;

    if (!company) {
      companiesDb.close();
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Calculate new expiry date
    let newExpiry: Date;
    const now = new Date();
    
    if (company.membershipExpiry) {
      const currentExpiry = new Date(company.membershipExpiry);
      // If current membership is still active, extend from current expiry
      if (currentExpiry > now) {
        newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + days);
      } else {
        // If expired, start from now
        newExpiry = new Date(now);
        newExpiry.setDate(newExpiry.getDate() + days);
      }
    } else {
      // No previous expiry, start from now
      newExpiry = new Date(now);
      newExpiry.setDate(newExpiry.getDate() + days);
    }

    // Update company membership
    companiesDb.prepare(`
      UPDATE companies 
      SET membershipStatus = 'active', 
          membershipExpiry = ?
      WHERE id = ?
    `).run(newExpiry.toISOString(), companyId);

    // Record payment (simulated for now)
    companiesDb.prepare(`
      INSERT INTO company_memberships (
        companyId, status, startDate, endDate, paymentDate, paymentAmount, notificationSent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      companyId,
      'active',
      now.toISOString(),
      newExpiry.toISOString(),
      now.toISOString(),
      0, // Free for now
      0
    );

    companiesDb.close();

    return NextResponse.json({
      success: true,
      newExpiry: newExpiry.toISOString(),
      message: 'Membership renewed successfully'
    });
  } catch (error) {
    console.error('Error renewing membership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
