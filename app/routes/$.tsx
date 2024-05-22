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

// This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the Remix and/or browser default.

import { Link, useLocation } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export async function loader() {
	throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
	// due to the loader, this component will never be rendered, but we'll return
	// the error boundary just in case.
	return <ErrorBoundary />
}

export function ErrorBoundary() {
	const location = useLocation()
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-3">
							<h1>We can't find this page:</h1>
							<pre className="whitespace-pre-wrap break-all text-body-lg">
								{location.pathname}
							</pre>
						</div>
						<Link to="/" className="text-body-md underline">
							<Icon name="arrow-left">Back to home</Icon>
						</Link>
					</div>
				),
			}}
		/>
	)
}
