import { NextRequest, NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toLowerCase()
    const results: any[] = []

    // Search in users database
    try {
      const usersDbPath = path.join(process.cwd(), 'users.db')
      const usersDb = new Database(usersDbPath)

      const usersQuery = `
        SELECT 
          id,
          username,
          email,
          firstName,
          lastName,
          image,
          'user' as accountType
        FROM users
        WHERE LOWER(username) LIKE ? 
           OR LOWER(email) LIKE ?
           OR LOWER(firstName) LIKE ?
           OR LOWER(lastName) LIKE ?
        LIMIT 10
      `

      const users = usersDb.prepare(usersQuery).all(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ) as any[]

      results.push(...users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        accountType: 'user'
      })))

      usersDb.close()
    } catch (e) {
      console.error('Error searching users:', e)
    }

    // Search in companies database
    try {
      const companiesDbPath = path.join(process.cwd(), 'companies.db')
      const companiesDb = new Database(companiesDbPath)

      const companiesQuery = `
        SELECT 
          id,
          username,
          email,
          sector,
          location,
          image,
          'company' as accountType
        FROM companies
        WHERE LOWER(username) LIKE ? 
           OR LOWER(email) LIKE ?
           OR LOWER(sector) LIKE ?
        LIMIT 10
      `

      const companies = companiesDb.prepare(companiesQuery).all(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ) as any[]

      results.push(...companies.map(company => ({
        id: company.id,
        username: company.username,
        email: company.email,
        sector: company.sector,
        location: company.location,
        image: company.image,
        accountType: 'company'
      })))

      companiesDb.close()
    } catch (e) {
      console.error('Error searching companies:', e)
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.username.toLowerCase() === searchTerm || a.email.toLowerCase() === searchTerm
      const bExact = b.username.toLowerCase() === searchTerm || b.email.toLowerCase() === searchTerm
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      return 0
    })

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 results
      count: results.length
    })
  } catch (error: any) {
    console.error('Error in search-users API:', error)
    return NextResponse.json(
      { error: 'Failed to search users', details: error.message },
      { status: 500 }
    )
  }
}
