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
	type ErrorResponse,
	isRouteErrorResponse,
	useParams,
	useRouteError,
} from '@remix-run/react'
import { captureRemixErrorBoundaryError } from '@sentry/remix'
import { getErrorMessage } from '#app/utils/misc.tsx'

type StatusHandler = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
}) => JSX.Element | null

export function GeneralErrorBoundary({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedErrorHandler = error => <p>{getErrorMessage(error)}</p>,
}: {
	defaultStatusHandler?: StatusHandler
	statusHandlers?: Record<number, StatusHandler>
	unexpectedErrorHandler?: (error: unknown) => JSX.Element | null
}) {
	const error = useRouteError()
	captureRemixErrorBoundaryError(error)
	const params = useParams()

	if (typeof document !== 'undefined') {
		console.error(error)
	}

	return (
		<div className="container flex items-center justify-center p-20 text-h2">
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedErrorHandler(error)}
		</div>
	)
}
