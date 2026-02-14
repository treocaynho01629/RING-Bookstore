import { Gender } from "../models/gender";
import { UserRole } from "../models/userRole";

export interface GenderTypeMeta {
  label: string;
  value: string;
  color: string;
}

export interface UserRoleMeta {
  label: string;
  value: string;
  color: string;
}

/**
 * Get gender type meta
 * @param {Gender} gender
 * @returns {GenderTypeMeta}
 */
export const getGenderType = (gender: Gender): GenderTypeMeta => {
  switch (gender) {
    case Gender.MALE:
      return {
        label: "gender.male",
        value: Gender.MALE,
        color: "primary",
      };
    case Gender.FEMALE:
      return {
        label: "gender.female",
        value: Gender.FEMALE,
        color: "secondary",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
        color: "default",
      };
  }
};

/**
 * Get gender type options
 */
export const genderTypeOptions: GenderTypeMeta[] = (Object.keys(Gender) as (keyof typeof Gender)[]).map((k) =>
  getGenderType(Gender[k])
);

/**
 * Get user role meta
 * @param {UserRole} userRole
 * @returns {UserRoleMeta}
 */
export const getUserRole = (userRole: UserRole): UserRoleMeta => {
  switch (userRole) {
    case UserRole.ROLE_USER:
      return {
        label: "role.user",
        value: UserRole.ROLE_USER,
        color: "default",
      };
    case UserRole.ROLE_SELLER:
      return {
        label: "role.seller",
        value: UserRole.ROLE_SELLER,
        color: "info",
      };
    case UserRole.ROLE_ADMIN:
      return {
        label: "role.admin",
        value: UserRole.ROLE_ADMIN,
        color: "primary",
      };
    case UserRole.ROLE_GUEST:
      return {
        label: "role.guest",
        value: UserRole.ROLE_GUEST,
        color: "warning",
      };
    default:
      return {
        label: "unknown",
        value: "UNKNOWN",
        color: "default",
      };
  }
};

/**
 * Get user role options
 */
export const userRoleOptions: UserRoleMeta[] = (Object.keys(UserRole) as (keyof typeof UserRole)[]).map((k) =>
  getUserRole(UserRole[k])
);
