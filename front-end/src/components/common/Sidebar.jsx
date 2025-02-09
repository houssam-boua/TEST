import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getRole } from "../../api/api";

const Sidebar = () => {
  const location = useLocation(); // Get current location
  const role = getRole();

  return (
    <div className="drawer-side font- border-r  border-base-300/10 shadow-xs rounded-sm">
      <ul className="menu bg-white min-h-full w-60 p-2 ">
        <div className="logo ml-5">
          <Link to="/">
            <img src={"/sorec-logo.png"} alt="SORECT Inc." className="w-40" />
          </Link>
        </div>

        {/* Expandable Message Section */}
        <li>
          <details>
            <summary className="cursor-pointer hover:rounded-md ">
              <span className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5 fill-primary"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
              </span>
              Chat
            </summary>
            <ul className="pl-4  space-y-1">
              <li>
                <Link
                  to="/messages/inbox"
                  className={`rounded-md ${
                    location.pathname === "/messages/inbox"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Envoie de mail
                  <span className="badge badge-sm bg-primary text-white text-xs  p-2">
                    0/2
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="/messages"
                  className={`rounded-md ${
                    location.pathname === "/messages"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Boite de reception
                </Link>
              </li>
            </ul>
          </details>
        </li>

        {/* Expandable Dashboard Section*/}
        <li>
          <details open>
            <summary className="cursor-pointer hover:rounded-lg text-body1 text-big-stone-900  ">
              <span className=" rounded-full p-0 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5 fill-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    clipRule="evenodd"
                  />
                  <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
                </svg>
              </span>
              Veille reglementaire
            </summary>
            <ul className="pl-4 space-y-1">
              <li>
                <Link
                  to="/applicabilite"
                  className={`rounded-md  ${
                    location.pathname === "/applicabilite"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Applicabilite
                </Link>
              </li>

              <li>
                <Link
                  to="/conformite"
                  className={`rounded-md  ${
                    location.pathname === "/conformite"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Conformite
                </Link>
              </li>

              <li>
                <Link
                  to="/actions"
                  className={`rounded-md ${
                    location.pathname === "/actions"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Action
                </Link>
              </li>
            </ul>
          </details>
        </li>

        {/* Expandable Reglement Section */}
        <li>
          <details>
            <summary className="cursor-pointer hover:rounded-lg ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 fill-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                  clipRule="evenodd"
                />
                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
              Lois et Reglements
            </summary>
            <ul className="pl-4 space-y-1">
              <li>
                <Link
                  to="/reglements"
                  className={`rounded-md ${
                    location.pathname === "/reglements"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Aperçu
                </Link>
              </li>

              <li>
                <Link
                  to="/reglements/create"
                  className={`rounded-md ${
                    location.pathname === "/reglements/create"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Ajouter un reglement
                </Link>
              </li>
              <li>
                <details>
                  <summary className=" cursor-pointer hover:rounded-lg">
                    Exigences
                  </summary>
                  <ul className="pl-4 space-y-1">
                    <li>
                      <Link
                        to="exigences/create"
                        className={`rounded-md ${
                          location.pathname === "exigences/create"
                            ? "bg-primary/15 text-primary"
                            : ""
                        }`}
                      >
                        Ajouter
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>

        {/* Expandable ISO Norms Section */}

        <li>
          <details>
            <summary className=" cursor-pointer hover:rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 fill-primary"
              >
                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                <path
                  fillRule="evenodd"
                  d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              Normes
            </summary>
            <ul className="pl-4 space-y-1">
              <li>
                <Link
                  to="/norms"
                  className={`rounded-md ${
                    location.pathname === "/norms"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Afficher tous
                </Link>
              </li>

              <li>
                <Link
                  to="/norms/create"
                  className={`rounded-md ${
                    location.pathname === "/norms/create"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Ajoute une norme
                </Link>
              </li>
            </ul>
          </details>
        </li>
        {/* Expandable Accounts Section */}
        <li>
          <details>
            <summary className=" cursor-pointer hover:rounded-md ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 fill-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Gestion des profiles
            </summary>
            <ul className="pl-4 space-y-1">
              <li>
                <Link
                  to="/users/list"
                  className={`rounded-md ${
                    location.pathname === "/users/list"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Utilisateurs
                </Link>
              </li>
              <li>
                <Link
                  to="/roles"
                  className={`rounded-md ${
                    location.pathname === "/roles"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Roles
                </Link>
              </li>
              <li>
                <Link
                  to="/permissions.show"
                  className={`rounded-md ${
                    location.pathname === "/permissions.show"
                      ? "bg-primary/15 text-primary"
                      : ""
                  }`}
                >
                  Permissions
                </Link>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
