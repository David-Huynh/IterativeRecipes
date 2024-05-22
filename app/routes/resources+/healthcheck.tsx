/*
 * This file is part of Iterative Recipes.
 *
 * Originally created by Kent C. Dodds.
 * Copyright (C) 2024 David Huynh <david@dhuynh.ca>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const host =
		request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')

	try {
		// if we can connect to the database and make a simple query
		// and make a HEAD request to ourselves, then we're good.
		await Promise.all([
			prisma.user.count(),
			fetch(`${new URL(request.url).protocol}${host}`, {
				method: 'HEAD',
				headers: { 'X-Healthcheck': 'true' },
			}).then(r => {
				if (!r.ok) return Promise.reject(r)
			}),
		])
		return new Response('OK')
	} catch (error: unknown) {
		console.log('healthcheck ❌', { error })
		return new Response('ERROR', { status: 500 })
	}
}
