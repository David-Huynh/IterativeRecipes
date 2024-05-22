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

import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useSearchParams } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import { requireAnonymous } from '#app/utils/auth.server.ts'
import {
	ProviderConnectionForm,
	providerNames,
} from '#app/utils/connections.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	return json({})
}

export default function LoginPage() {
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	return (
		<div className="flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="mx-auto w-full max-w-md">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Welcome!</h1>
				</div>
				<Spacer size="xs" />

				<div>
					<div className="mx-auto w-full max-w-md px-8">
						<ul className="mt-5 flex flex-col gap-5 py-3">
							{providerNames.map(providerName => (
								<li key={providerName}>
									<ProviderConnectionForm
										type="Login"
										providerName={providerName}
										redirectTo={redirectTo}
									/>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Login to Iterative Recipes' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
