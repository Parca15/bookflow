package com.bookflow.common.config;

public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String ROLE_SUPER_ADMIN = "hasRole('SUPER_ADMIN')";
    public static final String ROLE_ADMIN = "hasRole('ADMIN')";
    public static final String ROLE_MANAGER = "hasRole('MANAGER')";
    public static final String ROLE_RECEPTIONIST = "hasRole('RECEPTIONIST')";
    public static final String ROLE_EMPLOYEE = "hasRole('EMPLOYEE')";

    public static final String SUPER_ADMIN_ONLY = ROLE_SUPER_ADMIN;

    public static final String ADMIN_AND_ABOVE =
        ROLE_SUPER_ADMIN + " or " + ROLE_ADMIN;

    public static final String MANAGER_AND_ABOVE =
        ROLE_SUPER_ADMIN + " or " + ROLE_ADMIN + " or " + ROLE_MANAGER;

    public static final String RECEPTIONIST_AND_ABOVE =
        ROLE_SUPER_ADMIN + " or " + ROLE_ADMIN + " or " + ROLE_MANAGER + " or " + ROLE_RECEPTIONIST;

    public static final String ALL_AUTHENTICATED =
        ROLE_SUPER_ADMIN + " or " + ROLE_ADMIN + " or " + ROLE_MANAGER
        + " or " + ROLE_RECEPTIONIST + " or " + ROLE_EMPLOYEE;
}
