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

import { type SEOHandle } from '@nasa-gcn/remix-seo'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireRecentVerification } from '#app/routes/_auth+/verify.server.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useDoubleCheck } from '#app/utils/misc.tsx'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { type BreadcrumbHandle } from './profile.tsx'
import { twoFAVerificationType } from './profile.two-factor.tsx'

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: <Icon name="lock-open-1">Disable</Icon>,
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireRecentVerification(request)
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireRecentVerification(request)
	const userId = await requireUserId(request)
	await prisma.verification.delete({
		where: { target_type: { target: userId, type: twoFAVerificationType } },
	})
	return redirectWithToast('/settings/profile/two-factor', {
		title: '2FA Disabled',
		description: 'Two factor authentication has been disabled.',
	})
}

export default function TwoFactorDisableRoute() {
	const disable2FAFetcher = useFetcher<typeof action>()
	const dc = useDoubleCheck()

	return (
		<div className="mx-auto max-w-sm">
			<disable2FAFetcher.Form method="POST">
				<p>
					Disabling two factor authentication is not recommended. However, if
					you would like to do so, click here:
				</p>
				<StatusButton
					variant="destructive"
					status={disable2FAFetcher.state === 'loading' ? 'pending' : 'idle'}
					{...dc.getButtonProps({
						className: 'mx-auto',
						name: 'intent',
						value: 'disable',
						type: 'submit',
					})}
				>
					{dc.doubleCheck ? 'Are you sure?' : 'Disable 2FA'}
				</StatusButton>
			</disable2FAFetcher.Form>
		</div>
	)
}
