export const CONSTANTS = {
	ACCOUNT_SOCIAL_TYPES: {
		GOOGLE: 'google',
		FACEBOOK: 'facebook',
		APPLE: 'apple',
	},
	FUNDRAISER_TYPE: {
		myself: 'myself',
		someoneElse: 'someone-else',
		charityOrganization: 'charity-organization',
	},
	CAMPAIGN_STATUSES: {
		pendingApproval: 'pending-approval',
		active: 'active',
		completed: 'completed',
		rejected: 'rejected',
		removed: 'removed',
		draft: 'draft',
		inActive: 'in-active',
	},
	S3_FILE_TYPES: {
		profileImage: 'profile-image',
		campaignCoverImage: 'campaign-cover-image',
		campaignStoryImage: 'campaign-story-image',
		bankDocumentImage: 'bank-document-image',
		generalImage: 'general-image',
		invoice: 'invoice',
	},
	S3_IMAGE_DIRECTORIES: {
		profileImages: 'profile-images',
		campaignCoverImages: 'campaign-cover-images',
		campaignStoryImages: 'campaign-story-images',
		bankDocumentImages: 'bank-document-images',
		generalImages: 'general-images',
		invoices: 'invoices',
		campaignThumbnailCoverImages: 'campaign-thumbnail-cover-images',
	},
	PAYMENT_TYPES: {
		donation: 'donation',
		transfer: 'transfer',
		credit: 'credit',
	},
	LOG_TYPES: {
		user: {
			signup: 'user-signed-up',
			signin: 'user-signed-in',
			refreshToken: 'user-refresh-token',
			socialSignin: 'user-social-signed-in',
			socialSignup: 'user-social-signed-up',
			logout: 'user-logged-out',
			forgotPassword: 'user-forgot-password',
			resetPassword: 'user-reset-password',
			updatedPassword: 'user-updated-password',
			emailAddressVerified: 'user-email-address-verified',
			phoneNumberVerified: 'user-phone-number-verified',
			homeAddressUpdated: 'user-home-address-updated',
			bankingInfoUpdated: 'user-banking-info-updated',
			campaignDeactivated: 'user-campaign-deactivated',
			campaignCreated: 'user-campaign-created',
			campaignDuplicated: 'user-campaign-duplicated',
			campaignDraftCreated: 'user-campaign-draft-created',
			campaignDraftUpdated: 'user-campaign-draft-updated',
			campaignDetailsUpdated: 'user-campaign-details-updated',
			campaignSettingsUpdated: 'user-campaign-settings-updated',
			campaignDeleted: 'user-campaign-deleted',
			campaignGivingLevelAdded: 'user-campaign-giving-level-added',
			campaignGivingLevelUpdated: 'user-campaign-giving-level-updated',
			campaignGivingLevelDeleted: 'user-campaign-giving-level-deleted',
			donation: 'user-donation',
			cardInfoUpdated: 'user-card-info-updated',
			billingInfoUpdated: 'user-billing-info-updated',
			cardDeleted: 'user-card-deleted',
			profileUpdated: 'user-profile-updated',
			upSellAdded: 'user-campaign-up-sell-added',
			downSellAdded: 'user-campaign-down-sell-added',
			orderBumpAdded: 'user-campaign-order-bump-added',
			upSellUpdated: 'user-campaign-up-sell-updated',
			downSellUpdated: 'user-campaign-down-sell-updated',
			orderBumpUpdated: 'user-campaign-order-bump-updated',

			upSellDeleted: 'user-campaign-up-sell-deleted',
			downSellDeleted: 'user-campaign-down-sell-deleted',
			orderBumpDeleted: 'user-campaign-order-bump-deleted',

			teamMemberAdded: 'user-campaign-team-member-added',
			teamMemberUpdated: 'user-campaign-team-member-updated',
			teamMemberDeleted: 'user-campaign-team-member-deleted',
			teamMemberInvitationAccepted:
				'user-campaign-team-member-invitation-accepted',
			referralLinkCreated: 'user-campaign-referral-link-created',
			offlinePaymentCreated: 'user-campaign-offline-payment-created',
			paymentUpdated: 'user-campaign-payment-updated',
			donationReportDownloaded: 'user-downloaded-donation-report',
			statisticReportDownloaded: 'user-downloaded-statistics-report',
			referralLinkReportDownloaded:
				'user-downloaded-referral-links-report',
		},
		admin: {
			created: 'admin-created',
			signin: 'admin-signed-in',
			logout: 'admin-logged-out',
			campaignApproved: 'admin-campaign-approved',
			campaignRejected: 'admin-campaign-rejected',
			campaignActivated: 'admin-campaign-activated',
			campaignDeactivated: 'admin-campaign-deactivated',
			campaignFeatured: 'admin-campaign-featured',
			campaignUnfeatured: 'admin-campaign-unfeatured',
			charityCreated: 'admin-charity-created',
			charityUpdated: 'admin-charity-updated',
			charityDeleted: 'admin-charity-deleted',
			countryUpdated: 'admin-country-updated',
			userConfigUpdated: 'admin-user-config-updated',
			userBankInfoUpdated: 'admin-user-bank-info-updated',
			trasnferCreated: 'admin-transfer-created',
			categoryCreated: 'admin-category-created',
			categoryUpdated: 'admin-category-updated',
			categoryDeleted: 'admin-category-deleted',
			loggedInAsAUser: 'admin-logged-in-as-a-user',
			adminAccountCreated: 'admin-account-created',
			adminAccountUpdated: 'admin-account-updated',
			paymentRefunded: 'admin-payment-refunded',
			subscriptionCancelled: 'admin-subscription-cancelled',
			paymentCSVDowloaded: 'admin-payment-csv-downloaded',
			overallPaymentCSVDowloaded: 'admin-overall-payment-csv-downloaded',
			configurationUpdated: 'admin-configuration-updated',
		},
	},
	LOGS_DESCRIPTION: {
		admin: {
			'admin-campaign-approved':
				'Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN) got approved.',
			'admin-campaign-rejected':
				'Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN) got rejected.',
			'admin-campaign-featured':
				'Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN) marked as featured',
			'admin-campaign-unfeatured':
				'Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN) marked as unfeatured',
			'admin-charity-created':
				'Charity Organization: @CHARITY_ORGANIZATION created',
			'admin-charity-updated':
				'Charity Organization: @CHARITY_ORGANIZATION updated',
			'admin-charity-deleted':
				'Charity Organization: @CHARITY_ORGANIZATION deleted',
			'admin-country-updated': 'Country: @COUNTRY updated',
			'admin-user-config-updated':
				'Updated @USER_NAME - @USER_EMAIL (@UPDATED_PARAMS)',
			'admin-user-bank-info-updated':
				'Updated @USER_NAME - @USER_EMAIL bank details status to @STATUS',
			'admin-transfer-created':
				'Transfered @CURRENCY_SYMBOL @AMOUNT to @USER_NAME - @USER_EMAIL on Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-category-created': 'New Category @CATERGORY_NAME created.',
			'admin-category-updated': 'Category @CATERGORY_NAME updated.',
			'admin-category-deleted': 'Category @CATERGORY_NAME deleted.',
			'admin-logged-in-as-a-user':
				'Logged-in as @USER_NAME - @USER_EMAIL',
			'admin-account-created':
				'Created new Admin Account @LOG_DETAILS_ADMIN_NAME - @LOG_DETAILS_ADMIN_EMAIL as @LOG_DETAILS_ADMIN_ROLE_TYPE',
			'admin-account-updated':
				'Updated Admin Account @LOG_DETAILS_ADMIN_NAME - @LOG_DETAILS_ADMIN_EMAIL @LOG_DETAILS_ACTION',
			'admin-payment-csv-downloaded':
				'Admin downloaded payments CSV of Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN).',
			'admin-overall-payment-csv-downloaded':
				'Admin downloaded overall payments CSV',
			'admin-payment-refunded':
				'Payment Transaction of @CURRENCY_SYMBOL @AMOUNT against Campaign @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN) refunded',
			'admin-configuration-updated':
				'Admin updated payment processing fees percentage from @PREVIOUS_PAYMENT_PROCESSING_FEES to @NEW_PAYMENT_PROCESSING_FEES',
		},
		user: {
			'user-logged-out': 'Logged out from User: @USER_NAME - @USER_EMAIL',
			'user-updated-password':
				'Updated Password of User: @USER_NAME - @USER_EMAIL',
			'user-phone-number-verified':
				'Verified Phone Number @USER_VERIFIED_PHONE_NUMBER of User: @USER_NAME - @USER_EMAIL',
			'user-home-address-updated':
				'Updated home address of User: @USER_NAME - @USER_EMAIL',
			'user-banking-info-updated':
				'Updated Bank Info of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-created':
				'Created Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-deactivated':
				'Deactivated Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-duplicated':
				'Duplicated Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-draft-created':
				'Created Campaign Draft: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-draft-updated':
				'Updated Campaign Draft: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-details-updated':
				'Updated Campaign: @CAMPAIGN_TITLE details of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-settings-updated':
				'Updated Campaign: @CAMPAIGN_TITLE settings of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-deleted':
				'Deleted Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-giving-level-added':
				'Created Giving Level of Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-giving-level-updated':
				'Updated Giving Level of Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-giving-level-deleted':
				'Deleted Giving Level of Campaign: @CAMPAIGN_TITLE of User: @USER_NAME - @USER_EMAIL',
			'user-card-info-updated':
				'Updated card info of User: @USER_NAME - @USER_EMAIL',
			'user-billing-info-updated':
				'Updated billing info of User: @USER_NAME - @USER_EMAIL',
			'user-card-deleted':
				'Deleted card info of User: @USER_NAME - @USER_EMAIL',
			'user-profile-updated':
				'Updated profile of User: @USER_NAME - @USER_EMAIL',
			'user-campaign-team-member-added':
				'Added new team member @LOG_DETAILS_USER_EMAIL',
			'user-campaign-team-member-updated':
				'Updated team member @LOG_DETAILS_USER_EMAIL',
			'user-campaign-team-member-deleted': 'Deleted team member',
			'user-campaign-referral-link-created':
				'Referral link created @LINK_NAME - @LINK_OWNER',
			'user-campaign-offline-payment-created':
				'Offline Payment Created of Campaign: @CAMPAIGN_TITLE ',
			'user-campaign-payment-updated':
				'Payment Record Updated of Campaign: @CAMPAIGN_TITLE ',
			'user-downloaded-donation-report':
				'Downloaded User: @USER_EMAIL donation report (@DOWNLOADED_FILE_TYPE)',
			'user-downloaded-statistics-report':
				'Downloaded User: @USER_EMAIL statistics report (@DOWNLOADED_FILE_TYPE)',
			'user-downloaded-referral-links-report':
				'Downloaded User: @USER_EMAIL referral links report (@DOWNLOADED_FILE_TYPE)',
		},
	},
	PROFILE_AUDIT_TRIALS: {
		admin: {
			'admin-campaign-approved':
				'Approved Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-campaign-rejected':
				'Rejected Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-campaign-featured':
				'Marked as Featured Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-campaign-unfeatured':
				'Removed from featured Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-charity-created':
				'Created Charity Organization: @CHARITY_ORGANIZATION',
			'admin-charity-updated':
				'Updated Charity Organization: @CHARITY_ORGANIZATION',
			'admin-charity-deleted':
				'Deleted Charity Organization: @CHARITY_ORGANIZATION',
			'admin-country-updated': 'Updated Country: @COUNTRY',
			'admin-user-config-updated':
				'Updated @USER_NAME - @USER_EMAIL (@UPDATED_PARAMS)',
			'admin-user-bank-info-updated':
				'Updated @USER_NAME - @USER_EMAIL bank details status to @STATUS',
			'admin-transfer-created':
				'Transfered @AMOUNT to @USER_NAME - @USER_EMAIL on Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN)',
			'admin-category-created': 'Created Category @CATERGORY_NAME.',
			'admin-category-updated': 'Updated Category @CATERGORY_NAME.',
			'admin-category-deleted': 'Deleted Category @CATERGORY_NAME.',
			'admin-logged-in-as-a-user':
				'Logged-in as @USER_NAME - @USER_EMAIL',
			'admin-account-created':
				'Created Admin Account @LOG_DETAILS_ADMIN_NAME - @LOG_DETAILS_ADMIN_EMAIL as @LOG_DETAILS_ADMIN_ROLE_TYPE',
			'admin-account-updated':
				'Updated Admin Account @LOG_DETAILS_ADMIN_NAME - @LOG_DETAILS_ADMIN_EMAIL @LOG_DETAILS_ACTION',
			'admin-payment-csv-downloaded':
				'Admin downloaded payments CSV of Campaign: @CAMPAIGN_TITLE (@CAMPAIGN_RANDOM_TOKEN).',
			'admin-overall-payment-csv-downloaded':
				'Admin downloaded overall payments CSV',
		},
	},
	EMAIL_TEMPLATES: {
		signup: `<html>
		<body>
			<h3>Dear <strong>@USER_NAME,</strong></h3>
			<p>Welcome to Arolux.com! We are thrilled to have you on board and appreciate your trust in us. Please click on the following link to verify your email ${process.env.EMAIL_VERIFICATION_REDIRECTION_LINK}?token=@RANDOM_TOKEN</p>
		
			<div class="footer">
				<p>Regards, <br>
				Arolux Support Team <br>
				<a href="${process.env.FRONTEND_URL}">Arolux.com</a> | support@arolux.com </p>
			</div>
		</body>
		</html>`,
	},
	POSSIBLE_ZIP_CODE_VALIDATION_COUNTRIES: [
		'UK',
		'GB',
		'JE',
		'GG',
		'IM',
		'US',
		'CA',
		'IE',
		'DE',
		'JP',
		'FR',
		'AU',
		'IT',
		'CH',
		'AT',
		'ES',
		'NL',
		'BE',
		'DK',
		'SE',
		'NO',
		'BR',
		'PT',
		'FI',
		'AX',
		'KR',
		'CN',
		'TW',
		'SG',
		'DZ',
		'AD',
		'AR',
		'AM',
		'AZ',
		'BH',
		'BD',
		'BB',
		'BY',
		'BM',
		'BA',
		'IO',
		'BN',
		'BG',
		'KH',
		'CV',
		'CL',
		'CR',
		'HR',
		'CY',
		'CZ',
		'DO',
		'EC',
		'EG',
		'EE',
		'FO',
		'GE',
		'GR',
		'GL',
		'GT',
		'HT',
		'HN',
		'HU',
		'IS',
		'IN',
		'ID',
		'IL',
		'JO',
		'KZ',
		'KE',
		'KW',
		'KY',
		'LA',
		'LV',
		'LB',
		'LI',
		'LT',
		'LU',
		'MK',
		'MY',
		'MV',
		'MT',
		'MU',
		'MX',
		'MD',
		'MC',
		'MA',
		'NP',
		'NZ',
		'NI',
		'NG',
		'OM',
		'PA',
		'PK',
		'PY',
		'PH',
		'PL',
		'PR',
		'RO',
		'RU',
		'SM',
		'SA',
		'SN',
		'SK',
		'SI',
		'ZA',
		'LK',
		'TJ',
		'TH',
		'TN',
		'TR',
		'TM',
		'UA',
		'UY',
		'UZ',
		'VA',
		'VE',
		'ZM',
		'AS',
		'CC',
		'CK',
		'RS',
		'ME',
		'CS',
		'YU',
		'CX',
		'ET',
		'FK',
		'NF',
		'FM',
		'GF',
		'GN',
		'GP',
		'GS',
		'GU',
		'GW',
		'HM',
		'IQ',
		'KG',
		'LR',
		'LS',
		'MG',
		'MH',
		'MN',
		'MP',
		'MQ',
		'NC',
		'NE',
		'VI',
		'VN',
		'PF',
		'PG',
		'PM',
		'PN',
		'PW',
		'RE',
		'SH',
		'SJ',
		'SO',
		'SZ',
		'TC',
		'WF',
		'XK',
		'YT',
		'PE',
	],
	DONATION_TYPES: {
		oneTimeDonation: 'oneTimeDonation',
		monthlyDonation: 'recurringDonation',
	},
	ADMIN_TYPES: {
		superAdmin: 'super-admin',
		financeAdmin: 'finance-admin',
		approverAdmin: 'approver-admin',
		reporterAdmin: 'reporter-admin',
	},
	CAMPAIGN_MILESTONE_NOTIFICATIONS: [25, 50, 75, 100],
	USER_NOTIFICATION_PREFERENCE_TYPES: {
		campaignSubmission: 'Campaign Submission',
		campaignReSubmission: 'Campaign ReSubmission',
		campaignApproved: 'Campaign Approved',
		campaignRejected: 'Campaign Rejected',
	},
	CAMPAIGN_TEAM_MEMBER_ROLE_TYPES: {
		admin: 'admin',
		contentEditor: 'content-editor',
		financialManager: 'financial-manager',
		referralManager: 'referral-manager',
	},
	STATISTIC_TYPES: {
		visit: 'visit',
		donation: 'donation',
		credit: 'credit',
	},
	PAYMENT_STATUSES: {
		pending: 'pending',
		success: 'success',
		failed: 'failed',
		refunded: 'refunded',
		chargeback: 'chargeback',
		declined: 'declined',
		error: 'error',
		processing: 'processing',
		scheduled: 'scheduled',
		void: 'void',
	},
	RECURLY_INVOICE: {
		tipAmountLabel: 'Tip Amount',
		tipAmountCode: 'tip_amount',
		processingFeeLabel: 'Processing Fee',
		processingFeeCode: 'processing_fee',
	},
	RECURLY_SUBSCRIPTION_STATUS: {
		active: 'active',
		expired: 'expired',
	},
	ACCOUNT_TYPES: {
		user: 'user',
		admin: 'admin',
	},
	BLACK_LISTED_WORDS: [
		'syria',
		'cuba',
		'iran',
		'north korea',
		'crimea',
		'donetsk',
		'luhansk regions',
	],
	RECENT_TRANSACTION_FAILURE: {
		timeInMinutes: 5,
		failuresCount: 2,
	},
	LINE_ITEM_TYPES: {
		donation: 'donation',
		orderBump: 'orderBump',
		tip: 'tip',
		processingFee: 'processingFee',
		recurring: 'recurring',
	},
	FACEBOOK_EVENT_CLIENT_TYPE: {
		frontEnd: 'front-end',
		backEnd: 'back-end',
	},
	TIMEZONE: 'America/New_York',
	CRASH_CC_EMAIL_ADDRESS: 'i.syed@tekhqs.co.uk',
};
