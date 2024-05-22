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

import { expect, test, createUser } from '#tests/playwright-utils.ts'

test('Users can update their basic info', async ({ page, login }) => {
	await login()
	await page.goto('/settings/profile')

	const newUserData = createUser()

	await page.getByRole('textbox', { name: /^name/i }).fill(newUserData.name)
	await page
		.getByRole('textbox', { name: /^username/i })
		.fill(newUserData.username)

	await page.getByRole('button', { name: /^save/i }).click()
})

test('Users can update their profile photo', async ({ page, login }) => {
	const user = await login()
	await page.goto('/settings/profile')

	const beforeSrc = await page
		.getByRole('img', { name: user.name ?? user.username })
		.getAttribute('src')

	await page.getByRole('link', { name: /change profile photo/i }).click()

	await expect(page).toHaveURL(`/settings/profile/photo`)

	await page
		.getByRole('textbox', { name: /change/i })
		.setInputFiles('./tests/fixtures/images/user/kody.png')

	await page.getByRole('button', { name: /save/i }).click()

	await expect(
		page,
		'Was not redirected after saving the profile photo',
	).toHaveURL(`/settings/profile`)

	const afterSrc = await page
		.getByRole('img', { name: user.name ?? user.username })
		.getAttribute('src')

	expect(beforeSrc).not.toEqual(afterSrc)
})
