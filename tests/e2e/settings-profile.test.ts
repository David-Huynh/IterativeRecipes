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
