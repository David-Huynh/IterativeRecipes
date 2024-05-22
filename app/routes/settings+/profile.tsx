/*
 * This file is part of Iterative Recipes.
 *
 * Originally created by Kent C. Dodds.
 * Modified by David Huynh <david@dhuynh.ca>
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


import { invariantResponse } from '@epic-web/invariant'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useMatches } from '@remix-run/react'
import { z } from 'zod'
import { Spacer } from '#app/components/spacer.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'
import { useUser } from '#app/utils/user.ts'

export const BreadcrumbHandle = z.object({ breadcrumb: z.any() })
export type BreadcrumbHandle = z.infer<typeof BreadcrumbHandle>

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: <Icon name="file-text">Edit Profile</Icon>,
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { username: true },
	})
	invariantResponse(user, 'User not found', { status: 404 })
	return json({})
}

const BreadcrumbHandleMatch = z.object({
	handle: BreadcrumbHandle,
})

export default function EditUserProfile() {
	const user = useUser()
	const matches = useMatches()
	const breadcrumbs = matches
		.map(m => {
			const result = BreadcrumbHandleMatch.safeParse(m)
			if (!result.success || !result.data.handle.breadcrumb) return null
			return (
				<Link key={m.id} to={m.pathname} className="flex items-center">
					{result.data.handle.breadcrumb}
				</Link>
			)
		})
		.filter(Boolean)

	return (
		<div className="m-auto mb-24 mt-16 max-w-3xl">
			<div className="container">
				<ul className="flex gap-3">
					<li>
						<Link
							className="text-muted-foreground"
							to={`/users/${user.username}`}
						>
							Profile
						</Link>
					</li>
					{breadcrumbs.map((breadcrumb, i, arr) => (
						<li
							key={i}
							className={cn('flex items-center gap-3', {
								'text-muted-foreground': i < arr.length - 1,
							})}
						>
							{">"} {breadcrumb}
						</li>
					))}
				</ul>
			</div>
			<Spacer size="xs" />
			<main className="mx-auto bg-muted px-6 py-8 md:container md:rounded-3xl">
				<Outlet />
			</main>
		</div>
	)
}
