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

import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { cache } from '#app/utils/cache.server.ts'
import { getInstanceInfo } from '#app/utils/litefs.server'

export async function action({ request }: ActionFunctionArgs) {
	const { currentIsPrimary, primaryInstance } = await getInstanceInfo()
	if (!currentIsPrimary) {
		throw new Error(
			`${request.url} should only be called on the primary instance (${primaryInstance})}`,
		)
	}
	const token = process.env.INTERNAL_COMMAND_TOKEN
	const isAuthorized =
		request.headers.get('Authorization') === `Bearer ${token}`
	if (!isAuthorized) {
		// nah, you can't be here...
		return redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	}
	const { key, cacheValue } = z
		.object({ key: z.string(), cacheValue: z.unknown().optional() })
		.parse(await request.json())
	if (cacheValue === undefined) {
		await cache.delete(key)
	} else {
		// @ts-expect-error - we don't reliably know the type of cacheValue
		await cache.set(key, cacheValue)
	}
	return json({ success: true })
}
